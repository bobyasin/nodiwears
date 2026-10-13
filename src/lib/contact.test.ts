import { describe, expect, it } from 'vitest';

import { MAX_MESSAGE_LENGTH, buildMailtoUrl, validateContact } from './contact';

const mailCopy = { subject: 'Sipariş talebi', nameLabel: 'Ad', emailLabel: 'E-posta' };
const validInput = { name: 'Ayşe Yılmaz', email: 'ayse@example.com', message: '50 adet polo yaka nakış istiyoruz.' };

describe('validateContact', () => {
  it('should return no errors when all fields are valid', () => {
    expect(validateContact(validInput)).toEqual([]);
  });

  it('should reject a blank name', () => {
    expect(validateContact({ ...validInput, name: '   ' })).toEqual(['name-required']);
  });

  it('should reject an email without a domain', () => {
    expect(validateContact({ ...validInput, email: 'ayse@' })).toEqual(['email-invalid']);
  });

  it('should reject an empty message', () => {
    expect(validateContact({ ...validInput, message: '' })).toEqual(['message-required']);
  });

  it('should reject a message longer than the limit', () => {
    const message = 'a'.repeat(MAX_MESSAGE_LENGTH + 1);

    expect(validateContact({ ...validInput, message })).toEqual(['message-too-long']);
  });

  it('should report every invalid field at once', () => {
    expect(validateContact({ name: '', email: 'x', message: '' })).toEqual([
      'name-required',
      'email-invalid',
      'message-required',
    ]);
  });
});

describe('buildMailtoUrl', () => {
  it('should address the mail to the given recipient', () => {
    expect(buildMailtoUrl('merhaba@nodiwears.com', validInput, mailCopy)).toMatch(/^mailto:merhaba@nodiwears\.com\?/);
  });

  it('should encode special characters in subject and body', () => {
    const url = buildMailtoUrl('merhaba@nodiwears.com', { ...validInput, message: 'a&b=c' }, mailCopy);

    expect(url).toContain(encodeURIComponent('a&b=c'));
    expect(url).not.toContain('a&b=c');
  });

  it('should not let line breaks in the name inject extra mail headers', () => {
    const url = buildMailtoUrl('merhaba@nodiwears.com', { ...validInput, name: 'Ayşe\r\nBcc: x@evil.com' }, mailCopy);
    const subject = new URL(url).searchParams.get('subject') ?? '';

    expect(subject).not.toMatch(/[\r\n]/);
  });
});

describe('buildMailtoUrl copy', () => {
  it('should use the localized subject and field labels', () => {
    const url = buildMailtoUrl(
      'hello@nodiwears.com',
      { ...validInput, message: 'Hi' },
      { subject: 'Order request', nameLabel: 'Name', emailLabel: 'Email' },
    );
    const params = new URL(url).searchParams;

    expect(params.get('subject')).toBe('Order request - Ayşe Yılmaz');
    expect(params.get('body')).toContain('Name: Ayşe Yılmaz');
    expect(params.get('body')).toContain('Email: ayse@example.com');
  });
});
