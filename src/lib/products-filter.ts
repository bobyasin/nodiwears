import { buildProductsQuery, parseProductFilter, type ProductFilter } from '../data/products';
import { formatMessage } from './format';

/** Shows the product cards matching ?category= / ?type= and keeps the address in step with the chips. */
export function initProductsFilter(root: HTMLElement): void {
  const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-product-card]'));
  const chips = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-filter-category]'));
  const typeGroups = Array.from(root.querySelectorAll<HTMLElement>('[data-types-for]'));
  const count = root.querySelector<HTMLElement>('[data-count]');
  const empty = root.querySelector<HTMLElement>('[data-empty]');
  const template = root.dataset.countTemplate ?? '{n}';

  function chipFilter(chip: HTMLAnchorElement): ProductFilter {
    return {
      category: (chip.dataset.filterCategory || null) as ProductFilter['category'],
      type: (chip.dataset.filterType || null) as ProductFilter['type'],
      series: (chip.dataset.filterSeries || null) as ProductFilter['series'],
    };
  }

  function apply(filter: ProductFilter) {
    let shown = 0;

    for (const card of cards) {
      const inSeries = card.dataset.series ?? null;
      const visible = filter.series
        ? inSeries === filter.series
        : !inSeries &&
          (!filter.category || card.dataset.category === filter.category) && (!filter.type || card.dataset.type === filter.type);

      card.hidden = !visible;
      shown += visible ? 1 : 0;
    }

    for (const group of typeGroups) {
      group.hidden = group.dataset.typesFor !== filter.category;
    }

    for (const chip of chips) {
      const chipValue = chipFilter(chip);
      const isTypeChip = chip.dataset.filterType !== undefined;
      const active =
        chipValue.series === filter.series &&
        (isTypeChip
          ? chipValue.category === filter.category && chipValue.type === filter.type
          : chipValue.category === filter.category);

      if (active) {
        chip.setAttribute('aria-current', 'true');
      } else {
        chip.removeAttribute('aria-current');
      }
    }

    if (count) {
      count.textContent = formatMessage(template, { n: shown });
    }

    if (empty) {
      empty.hidden = shown > 0;
    }
  }

  root.addEventListener('click', (event) => {
    const chip = (event.target as Element).closest<HTMLAnchorElement>('[data-filter-category]');

    if (!chip || !root.contains(chip)) {
      return;
    }

    event.preventDefault();

    const filter = chipFilter(chip);

    history.pushState(null, '', `${location.pathname}${buildProductsQuery(filter)}`);
    apply(filter);
  });

  window.addEventListener('popstate', () => apply(parseProductFilter(new URLSearchParams(location.search))));

  apply(parseProductFilter(new URLSearchParams(location.search)));
}
