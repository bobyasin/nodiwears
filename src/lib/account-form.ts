import {
  MAX_NAME_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  validateLogin,
  validateProfile,
  validateRegister,
  type AccountError,
} from './account';
import { formatMessage } from './format';

type FormKind = 'login' | 'register' | 'profile';

interface Copy {
  errors: Record<string, string>;
  soonNote: string;
  showPassword: string;
  hidePassword: string;
}

function readJson<T>(value: string | undefined, fallback: T): T {
  try {
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function field(data: FormData, name: string): string {
  return String(data.get(name) ?? '');
}

function validate(kind: FormKind, data: FormData): AccountError[] {
  if (kind === 'login') {
    return validateLogin({ email: field(data, 'email'), password: field(data, 'password') });
  }

  if (kind === 'register') {
    return validateRegister({
      name: field(data, 'name'),
      email: field(data, 'email'),
      phone: field(data, 'phone'),
      password: field(data, 'password'),
      passwordRepeat: field(data, 'passwordRepeat'),
      acceptedPrivacy: data.get('privacy') === 'on',
    });
  }

  return validateProfile({ name: field(data, 'name'), phone: field(data, 'phone') });
}

/**
 * Validates an account form (login, register or profile) and shows the errors. There is no
 * account service yet, so a valid form only shows the "coming soon" note and sends nothing.
 */
export function initAccountForm(form: HTMLFormElement): void {
  const kind = (form.dataset.kind ?? 'login') as FormKind;
  const copy = readJson<Copy>(form.dataset.copy, { errors: {}, soonNote: '', showPassword: '', hidePassword: '' });
  const status = form.querySelector<HTMLElement>('[data-status]');
  const limits = { min: MIN_PASSWORD_LENGTH, maxPassword: MAX_PASSWORD_LENGTH, maxName: MAX_NAME_LENGTH };

  function show(message: string, tone: 'error' | 'note') {
    if (!status) {
      return;
    }

    status.textContent = message;
    status.dataset.tone = tone;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const errors = validate(kind, new FormData(form));

    if (errors.length > 0) {
      show(errors.map((error) => formatMessage(copy.errors[error] ?? error, limits)).join(' '), 'error');

      return;
    }

    show(copy.soonNote, 'note');
  });

  form.querySelectorAll<HTMLButtonElement>('[data-soon]').forEach((button) => {
    button.addEventListener('click', () => show(copy.soonNote, 'note'));
  });

  form.querySelectorAll<HTMLButtonElement>('[data-toggle-password]').forEach((button) => {
    const input = form.querySelector<HTMLInputElement>(`input[name="${button.dataset.togglePassword}"]`);

    button.addEventListener('click', () => {
      if (!input) {
        return;
      }

      const reveal = input.type === 'password';

      input.type = reveal ? 'text' : 'password';
      button.textContent = reveal ? copy.hidePassword : copy.showPassword;
      button.setAttribute('aria-pressed', String(reveal));
    });
  });
}

/** Tab buttons ([role=tab], aria-controls) switch between the panels they control. */
export function initTabs(root: HTMLElement): void {
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[role="tab"]'));

  function select(selected: HTMLButtonElement) {
    for (const tab of tabs) {
      const active = tab === selected;
      const panel = document.getElementById(tab.getAttribute('aria-controls') ?? '');

      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;

      if (panel) {
        panel.hidden = !active;
      }
    }
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (event) => {
      const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;

      if (step === 0) {
        return;
      }

      const next = tabs[(index + step + tabs.length) % tabs.length];

      select(next);
      next.focus();
    });
  });

  const first = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') ?? tabs[0];

  if (first) {
    select(first);
  }
}
