export interface ContactInput {
  name: string;
  email: string;
  message: string;
}

export type ContactError =
  | 'name-required'
  | 'name-too-long'
  | 'email-invalid'
  | 'message-required'
  | 'message-too-long';

export interface MailCopy {
  subject: string;
  nameLabel: string;
  emailLabel: string;
}

export const MAX_MESSAGE_LENGTH = 2000;
export const MAX_NAME_LENGTH = 100;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LINE_BREAKS = /[\r\n]+/g;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function validateContact(input: ContactInput): ContactError[] {
  const errors: ContactError[] = [];
  const name = input.name.trim();
  const message = input.message.trim();

  if (name.length === 0) {
    errors.push('name-required');
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.push('name-too-long');
  }

  if (!isValidEmail(input.email)) {
    errors.push('email-invalid');
  }

  if (message.length === 0) {
    errors.push('message-required');
  } else if (message.length > MAX_MESSAGE_LENGTH) {
    errors.push('message-too-long');
  }

  return errors;
}

export function buildMailtoUrl(recipient: string, input: ContactInput, copy: MailCopy): string {
  const name = input.name.replace(LINE_BREAKS, ' ').trim();
  const email = input.email.replace(LINE_BREAKS, ' ').trim();
  const subject = `${copy.subject} - ${name}`;
  const body = `${input.message.trim()}\n\n${copy.nameLabel}: ${name}\n${copy.emailLabel}: ${email}`;

  return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
