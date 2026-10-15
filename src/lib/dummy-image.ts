/** Number of placeholder images generated for every design. */
export const DUMMY_VARIANT_COUNT = 3;

const WIDTH = 600;
const HEIGHT = 400;
const GRID_ROWS = 9;
const GRID_COLUMNS = 9;

const STITCH_COLORS = ['#211a38', '#c9391b', '#f0c24b'] as const;
const FABRIC_TINTS = ['#ece7f6', '#e3f0e8', '#f6e6ea', '#f8ebc6'] as const;

export type DummyVariant = 1 | 2 | 3;

export interface DummyImageOptions {
  /** Stable text (the design id) that decides the pattern. */
  seed: string;
  /** 1 = the design, 2 = a close-up of the stitches, 3 = the design on a T-shirt. */
  variant: DummyVariant;
  /** Index of the collection; picks the fabric colour. */
  tint: number;
}

function createRandom(seed: string): () => number {
  let hash = 1779033703 ^ seed.length;

  for (let i = 0; i < seed.length; i++) {
    hash = Math.imul(hash ^ seed.charCodeAt(i), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }

  let state = hash >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;

    let value = Math.imul(state ^ (state >>> 15), state | 1);

    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** A left/right symmetric cross-stitch chart; every cell is -1 (empty) or a colour index. */
function createChart(seed: string): number[][] {
  const random = createRandom(seed);
  const half = Math.ceil(GRID_COLUMNS / 2);
  const chart: number[][] = [];

  for (let row = 0; row < GRID_ROWS; row++) {
    const cells: number[] = [];

    for (let column = 0; column < half; column++) {
      const roll = random();
      const nearCentre = column === half - 1 ? 0.15 : 0;

      if (roll < 0.42 - nearCentre) {
        cells.push(-1);
      } else if (roll < 0.78) {
        cells.push(0);
      } else if (roll < 0.93) {
        cells.push(1);
      } else {
        cells.push(2);
      }
    }

    chart.push([...cells, ...cells.slice(0, GRID_COLUMNS - half).reverse()]);
  }

  return chart;
}

function drawChart(chart: number[][], originX: number, originY: number, cell: number, thickness: number): string {
  const inset = cell * 0.18;
  let marks = '';

  chart.forEach((cells, row) => {
    cells.forEach((color, column) => {
      if (color < 0) {
        return;
      }

      const x = originX + column * cell;
      const y = originY + row * cell;
      const a = [x + inset, y + inset];
      const b = [x + cell - inset, y + cell - inset];
      const c = [x + cell - inset, y + inset];
      const d = [x + inset, y + cell - inset];

      marks += `<path d="M${a} L${b} M${c} L${d}" stroke="${STITCH_COLORS[color]}"/>`;
    });
  });

  return `<g fill="none" stroke-width="${thickness}" stroke-linecap="round">${marks}</g>`;
}

/** Faint dots at every stitch corner, like Aida embroidery cloth. */
function drawClothGrid(cell: number, offsetX: number, offsetY: number): string {
  const x = ((offsetX % cell) + cell) % cell;
  const y = ((offsetY % cell) + cell) % cell;
  const corners = [0, cell].flatMap((cx) => [0, cell].map((cy) => `<circle cx="${cx}" cy="${cy}" r="1.1"/>`)).join('');

  return (
    `<pattern id="cloth" width="${cell}" height="${cell}" x="${x}" y="${y}" patternUnits="userSpaceOnUse">` +
    `<g fill="#211a38">${corners}</g></pattern>` +
    `<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#cloth)" opacity="0.1"/>`
  );
}

const TSHIRT_PATH =
  'M190 70 L250 50 Q300 88 350 50 L410 70 L500 130 L450 182 L410 156 L410 350 L190 350 L190 156 L150 182 L100 130 Z';

/**
 * Builds a stand-in picture for a design. The art is a cross-stitch chart seeded by the
 * design id, so every design looks different and stays the same on every build. Real
 * photos replace these by listing them in the catalog data.
 */
export function renderDummyDesignImage({ seed, variant, tint }: DummyImageOptions): string {
  const fabric = FABRIC_TINTS[((tint % FABRIC_TINTS.length) + FABRIC_TINTS.length) % FABRIC_TINTS.length];
  const chart = createChart(seed);
  let body: string;

  if (variant === 1) {
    const cell = 30;
    const x = (WIDTH - GRID_COLUMNS * cell) / 2;
    // sit a little high so the caption on the panel does not cover the lower rows
    const y = (HEIGHT - GRID_ROWS * cell) / 2 - 24;

    body = `${drawClothGrid(cell, x, y)}${drawChart(chart, x, y, cell, 5)}`;
  } else if (variant === 2) {
    const cell = 72;
    const x = -cell * 1.5;
    const y = -cell * 1.8;

    body = `<rect width="${WIDTH}" height="${HEIGHT}" fill="#211a38" opacity="0.06"/>${drawClothGrid(cell, x, y)}${drawChart(chart, x, y, cell, 12)}`;
  } else {
    const cell = 13;
    const x = 300 - (GRID_COLUMNS * cell) / 2;
    const y = 128;

    body =
      `<path d="${TSHIRT_PATH}" fill="#ffffff" stroke="#211a38" stroke-opacity="0.18" stroke-width="2" stroke-linejoin="round"/>` +
      '<path d="M250 50 Q300 88 350 50" fill="none" stroke="#211a38" stroke-opacity="0.18" stroke-width="2"/>' +
      drawChart(chart, x, y, cell, 2.6);
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">` +
    `<rect width="${WIDTH}" height="${HEIGHT}" fill="${fabric}"/>${body}</svg>`
  );
}
