import { describe, expect, it } from 'vitest';

import {
  buildBreadcrumbSchema,
  buildOrganizationSchema,
  buildWebSiteSchema,
  serializeJsonLd,
} from './structured-data';

describe('structured data builders', () => {
  it('should describe the organization with its logo and email', () => {
    const schema = buildOrganizationSchema({
      name: 'nodiwears',
      url: 'https://www.nodiwears.com',
      logoUrl: 'https://www.nodiwears.com/logo.png',
      email: 'merhaba@nodiwears.com',
    });

    expect(schema).toMatchObject({ '@type': 'Organization', name: 'nodiwears', logo: 'https://www.nodiwears.com/logo.png' });
    expect(schema['@context']).toBe('https://schema.org');
  });

  it('should describe the website with its language', () => {
    expect(buildWebSiteSchema({ name: 'nodiwears', url: 'https://www.nodiwears.com/en/', language: 'en' })).toMatchObject({
      '@type': 'WebSite',
      inLanguage: 'en',
    });
  });

  it('should number breadcrumb items starting from one, in order', () => {
    const schema = buildBreadcrumbSchema([
      { name: 'Home', url: 'https://www.nodiwears.com/' },
      { name: 'Catalog', url: 'https://www.nodiwears.com/#katalog' },
      { name: 'Medusa', url: 'https://www.nodiwears.com/katalog/mitoloji-medusa/' },
    ]);

    expect(schema.itemListElement.map((item) => item.position)).toEqual([1, 2, 3]);
    expect(schema.itemListElement[2]).toMatchObject({ name: 'Medusa', item: 'https://www.nodiwears.com/katalog/mitoloji-medusa/' });
  });
});

describe('serializeJsonLd', () => {
  it('should never allow a value to close the script element', () => {
    const json = serializeJsonLd({ name: '</script><script>alert(1)</script>' });

    expect(json).not.toContain('</script>');
    expect(json).not.toContain('<');
  });

  it('should round-trip to the original data', () => {
    const data = { name: 'a < b & c', list: [1, 2] };

    expect(JSON.parse(serializeJsonLd(data))).toEqual(data);
  });
});
