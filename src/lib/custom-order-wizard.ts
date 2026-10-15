import { PRINT_CUSTOM, getPrintSpec, getProduct } from '../data/custom-order';
import type { PrintSpec } from '../data/custom-order';
import {
  ORDER_STEPS,
  buildOrderFormData,
  createDraft,
  findIncompleteStep,
  PRINT_MIN_CM,
  getColorHex,
  validateImage,
  validateStep,
  withPlacement,
  withPrintSize,
  withProduct,
} from './custom-order';
import type { ImageInfo, OrderDraft, OrderError, OrderStep } from './custom-order';
import { formatMessage } from './format';

interface Copy {
  errors: Record<string, string>;
  imageInfo: string;
  uploadLabel: string;
  uploadChange: string;
  submitFailed: string;
  submitting: string;
  submit: string;
  soonNote: string;
  printMax: string;
  printCustom: string;
  printCustomHint: string;
  placementCustom: string;
}

/** Localised names of ready-made sizes and named spots, keyed by product and id. */
interface Labels {
  presets: Record<string, { label: string; hint: string }>;
  positions: Record<string, Record<string, string>>;
}

const round = (value: number) => Math.round(value * 100) / 100;

function readJson<T>(value: string | undefined, fallback: T): T {
  try {
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function must<T extends Element>(root: ParentNode, selector: string): T {
  const found = root.querySelector<T>(selector);

  if (!found) {
    throw new Error(`missing element: ${selector}`);
  }

  return found;
}

export function startWizard(root: HTMLFormElement) {
  const copy = readJson<Copy>(root.dataset.copy, {
    errors: {},
    imageInfo: '',
    uploadLabel: '',
    uploadChange: '',
    submitFailed: '',
    submitting: '',
    submit: '',
    soonNote: '',
    printMax: '',
    printCustom: '',
    printCustomHint: '',
    placementCustom: '',
  });
  const labels = readJson<Labels>(root.dataset.labels, { presets: {}, positions: {} });
  const locale = root.dataset.locale ?? 'tr';
  const endpoint = root.dataset.endpoint ?? '';
  const steps: readonly OrderStep[] = ORDER_STEPS;
  const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-panel]'));
  const stepperItems = Array.from(document.querySelectorAll<HTMLElement>('[data-stepper]'));
  const status = must<HTMLElement>(root, '#order-status');
  const count = must<HTMLElement>(root, '#step-count');
  const previousButton = must<HTMLButtonElement>(root, '#previous');
  const nextButton = must<HTMLButtonElement>(root, '#next');
  const submitButton = must<HTMLButtonElement>(root, '#submit');
  const consent = must<HTMLInputElement>(root, '#consent');
  const imageInput = must<HTMLInputElement>(root, '#image');
  const uploadButton = must<HTMLElement>(root, '#upload-button');
  const uploadLocked = must<HTMLElement>(root, '#upload-locked');
  const picked = must<HTMLElement>(root, '#picked');
  const thumb = must<HTMLImageElement>(root, '#thumb');
  const imageInfoText = must<HTMLElement>(root, '#image-info');
  const mockup = must<HTMLElement>(root, '#mockup');
  const mockupShape = must(root, '#mockup-shape');
  const mockupDesign = must<HTMLImageElement>(root, '#mockup-design');
  const printCustom = must<HTMLElement>(root, '#print-custom');
  const printPresets = must<HTMLElement>(root, '#print-presets');
  const printMax = must<HTMLElement>(root, '#print-max');
  const spots = must<HTMLElement>(root, '#placement-presets');
  const placer = must<HTMLElement>(root, '#placer');
  const placerShape = must(root, '#placer-shape');
  const placerZone = must<HTMLElement>(root, '#placer-zone');
  const placerBox = must<HTMLElement>(root, '#placer-box');
  const placerDim = must<HTMLElement>(root, '#placer-dim');
  const placerCurrent = must<HTMLElement>(root, '#placement-current');
  const printWidth = must<HTMLInputElement>(root, 'input[name="printWidth"]');
  const printHeight = must<HTMLInputElement>(root, 'input[name="printHeight"]');

  let draft: OrderDraft = createDraft();
  let imageFile: File | null = null;
  let imageUrl = '';
  let current = 0;
  let reached = 0;

  const checkedLabel = (name: string) =>
    root.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`)?.dataset.label ?? '';

  function currentSpec(): PrintSpec | undefined {
    return getPrintSpec(draft.product ?? '');
  }

  function showErrors(errors: readonly OrderError[]) {
    const spec = currentSpec();
    const limits = { maxW: spec?.maxWidthCm ?? 0, maxH: spec?.maxHeightCm ?? 0, minCm: PRINT_MIN_CM };

    status.textContent = errors.map((error) => formatMessage(copy.errors[error] ?? error, limits)).join(' ');
  }

  function showStep(index: number, focus = true) {
    current = index;
    reached = Math.max(reached, index);

    panels.forEach((panel) => {
      panel.hidden = panel.dataset.panel !== (steps[index] ?? 'success');
    });
    stepperItems.forEach((item, position) => {
      const button = must<HTMLButtonElement>(item, 'button');

      button.disabled = position > reached || index >= steps.length;
      item.classList.toggle('is-done', position < index || index >= steps.length);

      if (position === index) {
        button.setAttribute('aria-current', 'step');
      } else {
        button.removeAttribute('aria-current');
      }
    });

    const finished = index >= steps.length;

    previousButton.hidden = index === 0 || finished;
    nextButton.hidden = index >= steps.length - 1;
    submitButton.hidden = index !== steps.length - 1;
    must<HTMLElement>(root, '#actions').hidden = finished;
    count.textContent = finished ? '' : `${index + 1} / ${steps.length}`;
    status.textContent = '';

    if (steps[index] === 'review') {
      renderReview();
    }

    if (focus) {
      must<HTMLElement>(root, `[data-panel="${steps[index] ?? 'success'}"] h2`).focus({ preventScroll: false });
    }
  }

  function updateSizes() {
    const product = draft.product;

    root.querySelectorAll<HTMLElement>('.size').forEach((label) => {
      const allowed = product !== null && (label.dataset.for ?? '').split(' ').includes(product);
      const input = must<HTMLInputElement>(label, 'input');

      label.hidden = !allowed;

      if (!allowed) {
        input.checked = false;
      }
    });
  }

  function clearImage() {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }

    imageUrl = '';
    imageFile = null;
    draft.image = null;
    imageInput.value = '';
    picked.hidden = true;
    thumb.removeAttribute('src');
    uploadButton.textContent = copy.uploadLabel;
  }

  function readImage(file: File): Promise<ImageInfo | null> {
    const url = URL.createObjectURL(file);

    return new Promise((resolve) => {
      const probe = new Image();

      probe.onload = () => {
        resolve({
          name: file.name,
          type: file.type,
          size: file.size,
          width: probe.naturalWidth,
          height: probe.naturalHeight,
        });
        URL.revokeObjectURL(url);
      };
      probe.onerror = () => {
        resolve(null);
        URL.revokeObjectURL(url);
      };
      probe.src = url;
    });
  }

  async function pickImage(file: File) {
    const unreadable: ImageInfo = { name: file.name, type: file.type, size: file.size, width: 0, height: 0 };
    // Cheap checks first, so a huge or wrong file is not even decoded.
    const early = validateImage({ ...unreadable, width: 1_000_000, height: 1_000_000 });

    if (early === 'image-type' || early === 'image-too-large') {
      clearImage();
      showErrors([early]);

      return;
    }

    const info = (await readImage(file)) ?? unreadable;
    const problem = validateImage(info);

    if (problem) {
      clearImage();
      showErrors([problem]);

      return;
    }

    clearImage();
    imageFile = file;
    imageUrl = URL.createObjectURL(file);
    draft.image = info;
    thumb.src = imageUrl;
    picked.hidden = false;
    uploadButton.textContent = copy.uploadChange;
    imageInfoText.textContent = formatMessage(copy.imageInfo, {
      name: info.name,
      width: info.width,
      height: info.height,
      size: (info.size / (1024 * 1024)).toFixed(1),
    });
    status.textContent = '';
  }

  function setConsent(given: boolean) {
    draft.consent = given;
    imageInput.disabled = !given;
    uploadLocked.hidden = given;
    uploadButton.classList.toggle('is-locked', !given);

    if (!given) {
      clearImage();
    }
  }

  function describePrint(): string {
    const { widthCm, heightCm } = draft.print;

    return widthCm === null || heightCm === null ? '' : `${widthCm} × ${heightCm} cm`;
  }

  function describePlacement(): string {
    const preset = draft.placement?.preset ?? '';
    const named = labels.positions[draft.product ?? '']?.[preset];

    return named ?? (draft.placement ? copy.placementCustom : '');
  }

  function readCentimetres(input: HTMLInputElement): number | null {
    return input.value.trim() === '' ? null : Number(input.value);
  }

  function element(tag: string, className: string, text = ''): HTMLElement {
    const created = document.createElement(tag);

    created.className = className;
    created.textContent = text;

    return created;
  }

  function radioOption(name: string, value: string, checked: boolean, parts: string[]): HTMLLabelElement {
    const label = document.createElement('label');
    const input = document.createElement('input');

    label.className = 'print-option';
    input.type = 'radio';
    input.name = name;
    input.value = value;
    input.checked = checked;
    input.className = 'visually-hidden';
    label.append(input, ...parts.map((text, index) => element('span', ['print-name', 'print-dim', 'print-hint'][index], text)));

    return label;
  }

  /** Ready-made sizes (and the custom field limits) depend on the chosen product. */
  function renderPrintOptions() {
    const spec = currentSpec();
    const product = draft.product ?? '';

    printPresets.replaceChildren();

    if (!spec) {
      return;
    }

    for (const preset of spec.presets) {
      const text = labels.presets[preset.id];

      printPresets.append(
        radioOption('print', preset.id, draft.print.preset === preset.id, [
          text?.label ?? preset.id,
          `${preset.widthCm} × ${preset.heightCm} cm`,
          text?.hint ?? '',
        ]),
      );
    }

    printPresets.append(radioOption('print', PRINT_CUSTOM, draft.print.preset === PRINT_CUSTOM, [copy.printCustom, '… × … cm', copy.printCustomHint]));
    printMax.textContent = formatMessage(copy.printMax, {
      product: getProduct(product)?.label[locale === 'en' ? 'en' : 'tr'] ?? '',
      maxW: spec.maxWidthCm,
      maxH: spec.maxHeightCm,
    });
    printWidth.max = String(spec.maxWidthCm);
    printHeight.max = String(spec.maxHeightCm);
    printCustom.hidden = draft.print.preset !== PRINT_CUSTOM;

    if (draft.print.preset === PRINT_CUSTOM) {
      printWidth.value = draft.print.widthCm === null ? '' : String(draft.print.widthCm);
      printHeight.value = draft.print.heightCm === null ? '' : String(draft.print.heightCm);
    }
  }

  function renderSpots() {
    const spec = currentSpec();

    spots.replaceChildren();

    if (!spec) {
      return;
    }

    for (const position of spec.positions) {
      const name = labels.positions[draft.product ?? '']?.[position.id] ?? position.id;

      spots.append(radioOption('spot', position.id, draft.placement?.preset === position.id, [name]));
    }
  }

  /** The picture with the printable zone and a box showing where, and how big, the print will be. */
  function renderPlacer() {
    const spec = currentSpec();

    if (!spec || !draft.placement) {
      return;
    }

    const width = (draft.print.widthCm ?? 0) * spec.percentPerCm;
    const height = (draft.print.heightCm ?? 0) * spec.percentPerCm;

    placer.style.setProperty('--garment', getColorHex(draft.color));
    placerShape.setAttribute('href', `#shape-${draft.product}`);
    placerZone.style.cssText = `left:${spec.zone.x}%;top:${spec.zone.y}%;width:${spec.zone.w}%;height:${spec.zone.h}%`;
    placerBox.style.cssText = `left:${round(draft.placement.x - width / 2)}%;top:${round(draft.placement.y - height / 2)}%;width:${round(width)}%;height:${round(height)}%`;
    placerDim.textContent = describePrint();
    placerCurrent.textContent = describePlacement();

    for (const radio of spots.querySelectorAll<HTMLInputElement>('input')) {
      radio.checked = radio.value === draft.placement.preset;
    }
  }

  function renderOptions() {
    renderPrintOptions();
    renderSpots();
    renderPlacer();
  }

  function setProduct(id: string) {
    const product = getProduct(id);

    if (!product) {
      return;
    }

    draft = withProduct(draft, product.id);
    updateSizes();
    renderOptions();
  }

  function selectPrint(radio: HTMLInputElement) {
    const spec = currentSpec();
    const preset = spec?.presets.find((candidate) => candidate.id === radio.value);

    if (preset) {
      draft = withPrintSize(draft, { preset: preset.id, widthCm: preset.widthCm, heightCm: preset.heightCm });
      printCustom.hidden = true;
    } else {
      draft = withPrintSize(draft, { preset: PRINT_CUSTOM, widthCm: draft.print.widthCm, heightCm: draft.print.heightCm });
      printWidth.value = draft.print.widthCm === null ? '' : String(draft.print.widthCm);
      printHeight.value = draft.print.heightCm === null ? '' : String(draft.print.heightCm);
      printCustom.hidden = false;
    }

    renderPlacer();
  }

  function placeFromPointer(event: MouseEvent) {
    const bounds = placer.getBoundingClientRect();

    if (bounds.width === 0 || bounds.height === 0) {
      return;
    }

    draft = withPlacement(draft, PRINT_CUSTOM, {
      x: ((event.clientX - bounds.left) / bounds.width) * 100,
      y: ((event.clientY - bounds.top) / bounds.height) * 100,
    });
    status.textContent = '';
    renderPlacer();
  }

  function nudgePlacement(event: KeyboardEvent) {
    const step = event.shiftKey ? 4 : 1;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const move = moves[event.key];

    if (!move || !draft.placement) {
      return;
    }

    event.preventDefault();
    draft = withPlacement(draft, PRINT_CUSTOM, { x: draft.placement.x + move[0], y: draft.placement.y + move[1] });
    renderPlacer();
  }

  function renderReview() {
    const spec = currentSpec();

    must<HTMLElement>(root, '#sum-product').textContent = checkedLabel('product');
    must<HTMLElement>(root, '#sum-color').textContent = checkedLabel('color');
    must<HTMLElement>(root, '#sum-size').textContent = checkedLabel('size');
    must<HTMLElement>(root, '#sum-print').textContent = describePrint();
    must<HTMLElement>(root, '#sum-placement').textContent = describePlacement();
    must<HTMLElement>(root, '#sum-image').textContent = draft.image?.name ?? '';
    mockup.style.setProperty('--garment', getColorHex(draft.color));
    mockupShape.setAttribute('href', `#shape-${draft.product ?? 'tshirt'}`);

    if (spec && draft.placement) {
      const width = (draft.print.widthCm ?? 0) * spec.percentPerCm;
      const height = (draft.print.heightCm ?? 0) * spec.percentPerCm;

      mockup.style.setProperty('--px', `${round(draft.placement.x - width / 2)}%`);
      mockup.style.setProperty('--py', `${round(draft.placement.y - height / 2)}%`);
      mockup.style.setProperty('--pw', `${round(width)}%`);
      mockup.style.setProperty('--ph', `${round(height)}%`);
    }

    mockupDesign.hidden = imageUrl === '';

    if (imageUrl) {
      mockupDesign.src = imageUrl;
    }
  }

  root.addEventListener('change', (event) => {
    const target = event.target;

    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
      return;
    }

    status.textContent = '';

    if (target.name === 'product') {
      setProduct(target.value);
    } else if (target.name === 'color') {
      draft.color = target.value;
      renderPlacer();
    } else if (target.name === 'size') {
      draft.size = target.value;
    } else if (target.name === 'print' && target instanceof HTMLInputElement) {
      selectPrint(target);
    } else if (target.name === 'spot' && target instanceof HTMLInputElement) {
      draft = withPlacement(draft, target.value);
      renderPlacer();
    } else if (target.name === 'consent') {
      setConsent((target as HTMLInputElement).checked);
    } else if (target instanceof HTMLInputElement && target.name === 'image' && target.files?.[0]) {
      void pickImage(target.files[0]);
    }
  });

  root.addEventListener('input', (event) => {
    const target = event.target;

    if (target instanceof HTMLTextAreaElement && target.name === 'note') {
      draft.note = target.value;
    } else if (target instanceof HTMLInputElement && (target.name === 'printWidth' || target.name === 'printHeight')) {
      draft = withPrintSize(draft, { preset: PRINT_CUSTOM, widthCm: readCentimetres(printWidth), heightCm: readCentimetres(printHeight) });
      renderPlacer();
    } else if (target instanceof HTMLInputElement && target.name === 'name') {
      draft.name = target.value;
    } else if (target instanceof HTMLInputElement && target.name === 'email') {
      draft.email = target.value;
    }
  });

  must(root, '#remove-image').addEventListener('click', () => clearImage());

  previousButton.addEventListener('click', () => showStep(Math.max(0, current - 1)));
  nextButton.addEventListener('click', () => {
    const errors = validateStep(steps[current], draft);

    if (errors.length > 0) {
      showErrors(errors);

      return;
    }

    showStep(current + 1);
  });

  document.querySelectorAll<HTMLButtonElement>('[data-goto]').forEach((button) => {
    button.addEventListener('click', () => showStep(Number(button.dataset.goto)));
  });

  root.addEventListener('submit', async (event) => {
    event.preventDefault();

    const incomplete = findIncompleteStep(draft);

    if (incomplete) {
      showStep(steps.indexOf(incomplete.step));
      showErrors(incomplete.errors);

      return;
    }

    if (!endpoint || !imageFile) {
      status.textContent = copy.soonNote;

      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = copy.submitting;

    try {
      const response = await fetch(endpoint, { method: 'POST', body: buildOrderFormData(draft, imageFile, locale) });

      if (!response.ok) {
        throw new Error(`order endpoint answered ${response.status}`);
      }

      clearImage();
      showStep(steps.length);
    } catch (error) {
      console.error('custom order failed', error);
      status.textContent = copy.submitFailed;
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = copy.submit;
    }
  });

  placer.addEventListener('click', placeFromPointer);
  placer.addEventListener('keydown', nudgePlacement);

  must(root, '#again').addEventListener('click', () => window.location.reload());

  setConsent(false);
  updateSizes();

  // Arriving from the products page (?product=hoodie): start with that product chosen.
  const requested = getProduct(new URLSearchParams(window.location.search).get('product') ?? '');
  const radio = requested ? root.querySelector<HTMLInputElement>(`input[name="product"][value="${requested.id}"]`) : null;

  if (radio) {
    radio.checked = true;
    setProduct(requested?.id ?? '');
    showStep(1, false);
  } else {
    showStep(0, false);
  }
}
