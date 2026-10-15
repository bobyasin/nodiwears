import type { APIRoute, GetStaticPaths } from 'astro';

import { catalogTree, collectDesigns } from '../../../data/site';
import { DUMMY_VARIANT_COUNT, renderDummyDesignImage, type DummyVariant } from '../../../lib/dummy-image';

// Placeholder pictures for the catalog until real photos are added (see getDesignImages).
export const getStaticPaths = (() =>
  collectDesigns(catalogTree, 'tr').flatMap(({ node, rootId }) =>
    Array.from({ length: DUMMY_VARIANT_COUNT }, (_, index) => ({
      params: { id: node.id, variant: String(index + 1) },
      props: { tint: catalogTree.findIndex((collection) => collection.id === rootId) },
    })),
  )) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params, props }) =>
  new Response(
    renderDummyDesignImage({
      seed: String(params.id),
      variant: Number(params.variant) as DummyVariant,
      tint: Number(props.tint),
    }),
    { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' } },
  );
