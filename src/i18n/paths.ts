import { defaultLocale, type Locale, type Localized } from './config';

const SEGMENTS: Localized<{ catalog: string; policies: string }> = {
  tr: { catalog: 'katalog', policies: 'politikalar' },
  en: { catalog: 'catalog', policies: 'policies' },
};

/** Standalone pages and their address in each language. */
export const PAGE_SLUGS = {
  customDesign: { tr: 'ozel-tasarim', en: 'custom-design' },
  products: { tr: 'urunler', en: 'products' },
  about: { tr: 'kurumsal/hakkimizda', en: 'corporate/about-us' },
  whoWeAre: { tr: 'kurumsal/biz-kimiz', en: 'corporate/who-we-are' },
  certificates: { tr: 'kurumsal/belgelerimiz', en: 'corporate/certificates' },
  contact: { tr: 'iletisim', en: 'contact' },
  login: { tr: 'giris', en: 'login' },
  register: { tr: 'kayit', en: 'register' },
  profile: { tr: 'profil', en: 'profile' },
} as const satisfies Record<string, Localized<string>>;

export type PageId = keyof typeof PAGE_SLUGS;

export function getPagePath(locale: Locale, page: PageId): string {
  return `${getPrefix(locale)}/${PAGE_SLUGS[page][locale]}/`;
}

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

export function getCustomDesignPath(locale: Locale): string {
  return getPagePath(locale, 'customDesign');
}
