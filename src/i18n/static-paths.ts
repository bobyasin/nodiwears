import { getPolicies } from '../data/policies';
import { catalogTree, collectDesigns } from '../data/site';
import type { Locale } from './config';

export function getDesignStaticPaths(locale: Locale) {
  return collectDesigns(catalogTree, locale).map(({ node, title, collection }) => ({
    params: { id: node.id },
    props: { id: node.id, title, collection },
  }));
}

export function getPolicyStaticPaths(locale: Locale) {
  return getPolicies(locale).map((policy) => ({
    params: { slug: policy.slug },
    props: { policy },
  }));
}
