import {
  DEFAULT_PLACEMENT,
  DEFAULT_PRINT_PRESET,
  PRINT_CUSTOM,
  colors,
  getPlacement,
  getPrintPreset,
  getPrintSpec,
  getProduct,
  isColor,
  type PrintSpec,
  type ProductId,
} from '../data/custom-order';
import { isValidEmail } from './contact';

export const ORDER_STEPS = ['product', 'options', 'upload', 'review'] as const;

export type OrderStep = (typeof ORDER_STEPS)[number];

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const IMAGE_MAX_BYTES = 8 * 1024 * 1024;
/** Shortest side, in pixels, a design needs to be embroidered cleanly. */
export const IMAGE_MIN_SIDE = 800;
/** Longest side, in pixels; larger files only slow the upload down. */
export const IMAGE_MAX_SIDE = 6000;
/** Smallest print worth stitching, in centimetres; the most depends on the product (see printSpecs). */
export const PRINT_MIN_CM = 2;
export const MAX_NOTE_LENGTH = 500;
export const MAX_NAME_LENGTH = 100;

export const ORDER_ERRORS = [
  'product-required',
  'color-required',
  'size-required',
  'print-size-required',
  'print-size-too-large',
  'print-size-too-small',
  'placement-invalid',
  'consent-required',
  'image-required',
  'image-type',
  'image-too-large',
  'image-too-small',
  'image-too-big-dimensions',
  'image-unreadable',
  'name-required',
  'name-too-long',
  'email-invalid',
  'note-too-long',
] as const;

export type OrderError = (typeof ORDER_ERRORS)[number];

export type ImageError = Extract<
  OrderError,
  'image-type' | 'image-too-large' | 'image-too-small' | 'image-too-big-dimensions' | 'image-unreadable'
>;

export interface ImageInfo {
  name: string;
  type: string;
  size: number;
  width: number;
  height: number;
}

export interface PrintSize {
  /** A preset id, or 'custom' for a size typed in by the visitor. */
  preset: string;
  widthCm: number | null;
  heightCm: number | null;
}

export interface Placement {
  /** A named spot of the product, or 'custom' when the visitor clicked on the picture. */
  preset: string;
  /** Centre of the print, in percent of the product picture. */
  x: number;
  y: number;
}

export interface OrderDraft {
  product: ProductId | null;
  color: string | null;
  size: string | null;
  print: PrintSize;
  placement: Placement | null;
  consent: boolean;
  image: ImageInfo | null;
  note: string;
  name: string;
  email: string;
}

export function createDraft(): OrderDraft {
  return {
    product: null,
    color: null,
    size: null,
    print: { preset: DEFAULT_PRINT_PRESET, widthCm: null, heightCm: null },
    placement: null,
    consent: false,
    image: null,
    note: '',
    name: '',
    email: '',
  };
}

/** Keeps a print of the given size inside the zone the product allows. */
export function clampPlacement(
  spec: PrintSpec,
  widthCm: number | null,
  heightCm: number | null,
  point: { x: number; y: number },
): { x: number; y: number } {
  const halfWidth = ((widthCm ?? 0) * spec.percentPerCm) / 2;
  const halfHeight = ((heightCm ?? 0) * spec.percentPerCm) / 2;
  const { zone } = spec;
  const fit = (value: number, start: number, length: number, half: number) =>
    half * 2 >= length ? start + length / 2 : Math.min(start + length - half, Math.max(start + half, value));

  return { x: fit(point.x, zone.x, zone.w, halfWidth), y: fit(point.y, zone.y, zone.h, halfHeight) };
}

/** A fresh draft for a product: its medium print size, centred in its default spot. */
export function withProduct(draft: OrderDraft, product: ProductId): OrderDraft {
  const spec = getPrintSpec(product);
  const preset = getPrintPreset(product, DEFAULT_PRINT_PRESET);
  const spot = getPlacement(product, DEFAULT_PLACEMENT) ?? spec?.positions[0];

  if (!spec || !preset || !spot) {
    return { ...draft, product, size: null };
  }

  return {
    ...draft,
    product,
    size: null,
    print: { preset: preset.id, widthCm: preset.widthCm, heightCm: preset.heightCm },
    placement: { preset: spot.id, ...clampPlacement(spec, preset.widthCm, preset.heightCm, spot) },
  };
}

/** Changes the print size and nudges the placement back inside the zone if the new size needs it. */
export function withPrintSize(draft: OrderDraft, print: PrintSize): OrderDraft {
  const spec = getPrintSpec(draft.product ?? '');

  if (!spec || !draft.placement) {
    return { ...draft, print };
  }

  const moved = clampPlacement(spec, print.widthCm, print.heightCm, draft.placement);

  return { ...draft, print, placement: { ...draft.placement, ...moved } };
}

/** Moves the print to a named spot (clamped) or, for 'custom', to the given point. */
export function withPlacement(draft: OrderDraft, preset: string, point?: { x: number; y: number }): OrderDraft {
  const spec = getPrintSpec(draft.product ?? '');
  const spot = getPlacement(draft.product ?? '', preset);
  const target = spot ?? point;

  if (!spec || !target) {
    return draft;
  }

  return {
    ...draft,
    placement: { preset: spot ? spot.id : PRINT_CUSTOM, ...clampPlacement(spec, draft.print.widthCm, draft.print.heightCm, target) },
  };
}

export function validateImage(image: ImageInfo): ImageError | null {
  if (!(IMAGE_TYPES as readonly string[]).includes(image.type)) {
    return 'image-type';
  }

  if (image.size > IMAGE_MAX_BYTES) {
    return 'image-too-large';
  }

  if (image.width <= 0 || image.height <= 0) {
    return 'image-unreadable';
  }

  if (Math.min(image.width, image.height) < IMAGE_MIN_SIDE) {
    return 'image-too-small';
  }

  if (Math.max(image.width, image.height) > IMAGE_MAX_SIDE) {
    return 'image-too-big-dimensions';
  }

  return null;
}

export function validateStep(step: OrderStep, draft: OrderDraft): OrderError[] {
  switch (step) {
    case 'product':
      return getProduct(draft.product ?? '') ? [] : ['product-required'];
    case 'options':
      return validateOptions(draft);
    case 'upload':
      return validateUpload(draft);
    case 'review':
      return validateReview(draft);
  }
}

/** First step that still has something to fix, with its errors; null when the order is complete. */
export function findIncompleteStep(draft: OrderDraft): { step: OrderStep; errors: OrderError[] } | null {
  for (const step of ORDER_STEPS) {
    const errors = validateStep(step, draft);

    if (errors.length > 0) {
      return { step, errors };
    }
  }

  return null;
}

function validateOptions(draft: OrderDraft): OrderError[] {
  const product = getProduct(draft.product ?? '');
  const errors: OrderError[] = [];

  if (!draft.color || !isColor(draft.color)) {
    errors.push('color-required');
  }

  if (!product || !draft.size || !product.sizes.includes(draft.size)) {
    errors.push('size-required');
  }

  const spec = getPrintSpec(draft.product ?? '');

  if (spec) {
    const printError = validatePrintSize(draft.print, spec);

    if (printError) {
      errors.push(printError);
    } else if (!isPlacementInside(draft, spec)) {
      errors.push('placement-invalid');
    }
  }

  return errors;
}

export function validatePrintSize(print: PrintSize, spec: PrintSpec): OrderError | null {
  const { widthCm, heightCm } = print;

  if (widthCm === null || heightCm === null || !Number.isFinite(widthCm) || !Number.isFinite(heightCm)) {
    return 'print-size-required';
  }

  if (widthCm > spec.maxWidthCm || heightCm > spec.maxHeightCm) {
    return 'print-size-too-large';
  }

  if (widthCm < PRINT_MIN_CM || heightCm < PRINT_MIN_CM) {
    return 'print-size-too-small';
  }

  return null;
}

const PLACEMENT_TOLERANCE = 0.01;

function isPlacementInside(draft: OrderDraft, spec: PrintSpec): boolean {
  if (!draft.placement) {
    return false;
  }

  const { x, y } = clampPlacement(spec, draft.print.widthCm, draft.print.heightCm, draft.placement);

  return Math.abs(x - draft.placement.x) < PLACEMENT_TOLERANCE && Math.abs(y - draft.placement.y) < PLACEMENT_TOLERANCE;
}

function validateUpload(draft: OrderDraft): OrderError[] {
  if (!draft.consent) {
    return ['consent-required'];
  }

  if (!draft.image) {
    return ['image-required'];
  }

  const imageError = validateImage(draft.image);

  return imageError ? [imageError] : [];
}

function validateReview(draft: OrderDraft): OrderError[] {
  const errors: OrderError[] = [];
  const name = draft.name.trim();

  if (name.length === 0) {
    errors.push('name-required');
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.push('name-too-long');
  }

  if (!isValidEmail(draft.email)) {
    errors.push('email-invalid');
  }

  if (draft.note.trim().length > MAX_NOTE_LENGTH) {
    errors.push('note-too-long');
  }

  return errors;
}

/** The multipart body sent to the order endpoint; the server must validate everything again. */
export function buildOrderFormData(draft: OrderDraft, image: Blob, locale: string): FormData {
  const body = new FormData();

  body.set('locale', locale);
  body.set('product', draft.product ?? '');
  body.set('color', draft.color ?? '');
  body.set('size', draft.size ?? '');
  body.set('printPreset', draft.print.preset);
  body.set('printWidthCm', String(draft.print.widthCm ?? ''));
  body.set('printHeightCm', String(draft.print.heightCm ?? ''));
  body.set('placementPreset', draft.placement?.preset ?? '');
  body.set('placementX', String(draft.placement?.x ?? ''));
  body.set('placementY', String(draft.placement?.y ?? ''));
  body.set('name', draft.name.trim());
  body.set('email', draft.email.trim());
  body.set('note', draft.note.trim());
  body.set('consent', draft.consent ? 'yes' : 'no');
  body.set('image', image, draft.image?.name ?? 'design');

  return body;
}

export function getColorHex(id: string | null): string {
  return colors.find((color) => color.id === id)?.hex ?? '#ffffff';
}
