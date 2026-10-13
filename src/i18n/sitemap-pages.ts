import { getPolicies, getPolicyById } from '../data/policies';
import { catalogTree, collectDesigns } from '../data/site';
import type { PagePaths } from '../lib/sitemap';
import { getDesignPath, getHomePath, getPolicyPath } from './paths';

export function getSitemapPages(): PagePaths[] {
  const designs = collectDesigns(catalogTree, 'tr').map(
    ({ node }): PagePaths => ({ tr: getDesignPath('tr', node.id), en: getDesignPath('en', node.id) }),
  );
  const policies = getPolicies('tr').map(
    (policy): PagePaths => ({
      tr: getPolicyPath('tr', policy.slug),
      en: getPolicyPath('en', getPolicyById('en', policy.id)?.slug ?? policy.slug),
    }),
  );

  return [{ tr: getHomePath('tr'), en: getHomePath('en') }, ...designs, ...policies];
}
