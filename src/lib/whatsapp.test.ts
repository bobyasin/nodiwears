import { describe, expect, it } from 'vitest';

import { buildWhatsAppUrl, normalizeWhatsAppNumber } from './whatsapp';

describe('normalizeWhatsAppNumber', () => {
  it('should keep only the digits of an international number', () => {
    expect(normalizeWhatsAppNumber('+90 532 123 45 67')).toBe('905321234567');
  });

  it('should drop the 00 international prefix', () => {
    expect(normalizeWhatsAppNumber('0090 532 123 45 67')).toBe('905321234567');
  });

  it('should turn a Turkish national number into the international form', () => {
    expect(normalizeWhatsAppNumber('0532 123 45 67')).toBe('905321234567');
  });

  it('should reject an empty value', () => {
    expect(normalizeWhatsAppNumber('')).toBeNull();
    expect(normalizeWhatsAppNumber('   ')).toBeNull();
  });

  it('should reject the placeholder phone number', () => {
    expect(normalizeWhatsAppNumber('+90 000 000 00 00')).toBeNull();
  });

  it('should reject numbers that are too short or too long', () => {
    expect(normalizeWhatsAppNumber('+90 532 12')).toBeNull();
    expect(normalizeWhatsAppNumber('1234567890123456')).toBeNull();
  });
});

describe('buildWhatsAppUrl', () => {
  it('should open a chat with the message already written', () => {
    expect(buildWhatsAppUrl('+90 532 123 45 67', 'Merhaba, "Medusa" ile ilgileniyorum.')).toBe(
      'https://wa.me/905321234567?text=Merhaba%2C%20%22Medusa%22%20ile%20ilgileniyorum.',
    );
  });

  it('should return null when the number is not usable', () => {
    expect(buildWhatsAppUrl('', 'Merhaba')).toBeNull();
    expect(buildWhatsAppUrl('+90 000 000 00 00', 'Merhaba')).toBeNull();
  });
});
