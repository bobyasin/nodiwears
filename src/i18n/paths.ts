import { defaultLocale, type Locale, type Localized } from './config';

const SEGMENTS: Localized<{ catalog: string; policies: string }> = {
  tr: { catalog: 'katalog', policies: 'politikalar' },
  en: { catalog: 'catalog', policies: 'policies' },
};

function getPrefix(locale: Locale): string {
  return locale === defaultLocale ? '' : `/${locale}`;
}

export function getHomePath(locale: Locale): string {
  return `${getPrefix(locale)}/`;
}

export function getSectionPath(locale: Locale, sectionId: string): string {
  return `${getHomePath(locale)}#${sectionId}`;
}

export function getDesignPath(locale: Locale, id: string): string {
  return `${getPrefix(locale)}/${SEGMENTS[locale].catalog}/${id}/`;
}

export function getPolicyPath(locale: Locale, slug: string): string {
  return `${getPrefix(locale)}/${SEGMENTS[locale].policies}/${slug}/`;
}
