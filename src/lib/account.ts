import { isValidEmail } from './contact';

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 72;
export const MAX_NAME_LENGTH = 100;

const PHONE_PATTERN = /^\+?[\d\s()-]+$/;
const MIN_PHONE_DIGITS = 10;
const MAX_PHONE_DIGITS = 15;

export const ACCOUNT_ERRORS = [
  'name-required',
  'name-too-long',
  'email-invalid',
  'phone-invalid',
  'password-required',
  'password-too-short',
  'password-too-long',
  'password-mismatch',
  'privacy-required',
] as const;

export type AccountError = (typeof ACCOUNT_ERRORS)[number];

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  passwordRepeat: string;
  acceptedPrivacy: boolean;
}

export interface ProfileInput {
  name: string;
  phone: string;
}

function validateName(value: string): AccountError[] {
  const name = value.trim();

  if (name.length === 0) {
    return ['name-required'];
  }

  return name.length > MAX_NAME_LENGTH ? ['name-too-long'] : [];
}

/** The phone number is optional; when given it must look like a real one. */
function validatePhone(value: string): AccountError[] {
  const phone = value.trim();

  if (phone.length === 0) {
    return [];
  }

  const digits = phone.replace(/\D/g, '').length;

  return PHONE_PATTERN.test(phone) && digits >= MIN_PHONE_DIGITS && digits <= MAX_PHONE_DIGITS ? [] : ['phone-invalid'];
}

function validateNewPassword(password: string): AccountError[] {
  if (password.length === 0) {
    return ['password-required'];
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return ['password-too-short'];
  }

  return password.length > MAX_PASSWORD_LENGTH ? ['password-too-long'] : [];
}

export function validateLogin(input: LoginInput): AccountError[] {
  const errors: AccountError[] = [];

  if (!isValidEmail(input.email)) {
    errors.push('email-invalid');
  }

  if (input.password.length === 0) {
    errors.push('password-required');
  }

  return errors;
}

export function validateRegister(input: RegisterInput): AccountError[] {
  const errors = [
    ...validateName(input.name),
    ...(isValidEmail(input.email) ? [] : (['email-invalid'] as const)),
    ...validatePhone(input.phone),
    ...validateNewPassword(input.password),
  ];

  if (input.password.length > 0 && input.password !== input.passwordRepeat) {
    errors.push('password-mismatch');
  }

  if (!input.acceptedPrivacy) {
    errors.push('privacy-required');
  }

  return errors;
}

export function validateProfile(input: ProfileInput): AccountError[] {
  return [...validateName(input.name), ...validatePhone(input.phone)];
}
