export interface BreadcrumbItem {
  name: string;
  url: string;
}

const SCHEMA_CONTEXT = 'https://schema.org';

export function buildOrganizationSchema(input: { name: string; url: string; logoUrl: string; email: string }) {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'Organization',
    name: input.name,
    url: input.url,
    logo: input.logoUrl,
    email: input.email,
  };
}

export function buildWebSiteSchema(input: { name: string; url: string; language: string }) {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'WebSite',
    name: input.name,
    url: input.url,
    inLanguage: input.language,
  };
}

export function buildBreadcrumbSchema(items: readonly BreadcrumbItem[]) {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// "<" is escaped so a value can never close the surrounding <script> element.
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
