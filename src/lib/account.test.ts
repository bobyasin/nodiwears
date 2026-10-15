import { describe, expect, it } from 'vitest';

import { locales } from '../i18n/config';
import { ui } from '../i18n/ui';
import {
  ACCOUNT_ERRORS,
  MAX_NAME_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  validateLogin,
  validateProfile,
  validateRegister,
  type RegisterInput,
} from './account';

const goodRegistration: RegisterInput = {
  name: 'Ayşe Yılmaz',
  email: 'ayse@example.com',
  phone: '+90 532 123 45 67',
  password: 'correct-horse',
  passwordRepeat: 'correct-horse',
  acceptedPrivacy: true,
};

describe('validateLogin', () => {
  it('should accept an email and a password', () => {
    expect(validateLogin({ email: 'a@b.co', password: 'x' })).toEqual([]);
  });

  it('should report a bad email and a missing password together', () => {
    expect(validateLogin({ email: 'nope', password: '' })).toEqual(['email-invalid', 'password-required']);
  });

  it('should not trim the password but trim the email', () => {
    expect(validateLogin({ email: '  a@b.co  ', password: '   ' })).toEqual([]);
  });
});

describe('validateRegister', () => {
  it('should accept a complete registration', () => {
    expect(validateRegister(goodRegistration)).toEqual([]);
  });

  it('should treat the phone number as optional', () => {
    expect(validateRegister({ ...goodRegistration, phone: '' })).toEqual([]);
  });

  it.each(['abc', '12345', '+90 (532) 123 45 6x', '1'.repeat(16)])('should reject the phone number "%s"', (phone) => {
    expect(validateRegister({ ...goodRegistration, phone })).toEqual(['phone-invalid']);
  });

  it('should require a name of reasonable length', () => {
    expect(validateRegister({ ...goodRegistration, name: '  ' })).toEqual(['name-required']);
    expect(validateRegister({ ...goodRegistration, name: 'a'.repeat(MAX_NAME_LENGTH + 1) })).toEqual(['name-too-long']);
  });

  it('should enforce the password length limits', () => {
    const short = 'a'.repeat(MIN_PASSWORD_LENGTH - 1);
    const long = 'a'.repeat(MAX_PASSWORD_LENGTH + 1);

    expect(validateRegister({ ...goodRegistration, password: '', passwordRepeat: '' })).toEqual(['password-required']);
    expect(validateRegister({ ...goodRegistration, password: short, passwordRepeat: short })).toEqual(['password-too-short']);
    expect(validateRegister({ ...goodRegistration, password: long, passwordRepeat: long })).toEqual(['password-too-long']);
    expect(
      validateRegister({ ...goodRegistration, password: 'a'.repeat(MIN_PASSWORD_LENGTH), passwordRepeat: 'a'.repeat(MIN_PASSWORD_LENGTH) }),
    ).toEqual([]);
  });

  it('should require the repeated password to match', () => {
    expect(validateRegister({ ...goodRegistration, passwordRepeat: 'different-one' })).toEqual(['password-mismatch']);
  });

  it('should require the privacy notice to be accepted', () => {
    expect(validateRegister({ ...goodRegistration, acceptedPrivacy: false })).toEqual(['privacy-required']);
  });

  it('should report every problem at once', () => {
    expect(
      validateRegister({ name: '', email: 'x', phone: 'x', password: '', passwordRepeat: '', acceptedPrivacy: false }),
    ).toEqual(['name-required', 'email-invalid', 'phone-invalid', 'password-required', 'privacy-required']);
  });
});

describe('validateProfile', () => {
  it('should check the name and the optional phone number', () => {
    expect(validateProfile({ name: 'Ayşe', phone: '' })).toEqual([]);
    expect(validateProfile({ name: '', phone: '123' })).toEqual(['name-required', 'phone-invalid']);
  });
});

describe('account copy', () => {
  it.each(locales)('should explain every account error in %s', (locale) => {
    expect(Object.keys(ui[locale].account.errors).sort()).toEqual([...ACCOUNT_ERRORS].sort());
  });
});
