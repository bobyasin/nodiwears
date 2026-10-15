const MIN_DIGITS = 10;
const MAX_DIGITS = 15;

/**
 * Turns a phone number as people write it ("+90 532 000 00 00", "0532 000 00 00",
 * "0090 532 ...") into the digits-only international form WhatsApp links need.
 * Returns null for anything that is empty or not a plausible number, so a
 * placeholder never becomes a live link.
 */
export function normalizeWhatsAppNumber(input: string): string | null {
  let digits = input.replace(/\D/g, '');

  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    // Turkish national format: 05xx xxx xx xx
    digits = `90${digits.slice(1)}`;
  }

  if (digits.length < MIN_DIGITS || digits.length > MAX_DIGITS || !/[1-9]/.test(digits.slice(2))) {
    return null;
  }

  return digits;
}

/** Link that opens a WhatsApp chat with the message already typed in; null if the number is not usable. */
export function buildWhatsAppUrl(number: string, message: string): string | null {
  const normalized = normalizeWhatsAppNumber(number);

  if (!normalized) {
    return null;
  }

  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
