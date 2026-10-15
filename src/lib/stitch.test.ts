import { describe, expect, it } from 'vitest';

import { buildStitchPlan, NO_BIN } from './stitch';

const WIDTH = 40;
const HEIGHT = 20;

const NAVY = [20, 30, 60] as const;
const LILAC = [150, 110, 205] as const;

function makeImage(
  dark: readonly (readonly [number, number])[],
  colour: readonly [number, number, number] = NAVY,
  base?: Uint8ClampedArray,
): Uint8ClampedArray {
  const data = base ?? new Uint8ClampedArray(WIDTH * HEIGHT * 4).fill(250);

  for (const [x, y] of dark) {
    const offset = (y * WIDTH + x) * 4;

    data[offset] = colour[0];
    data[offset + 1] = colour[1];
    data[offset + 2] = colour[2];
  }

  return data;
}

const at = (x: number, y: number) => y * WIDTH + x;

// A vertical stroke (x = 5, y = 2..14) joined to a horizontal one (y = 14, x = 5..20),
// plus a separate block on the right that is not connected to either.
const stroke: [number, number][] = [
  ...Array.from({ length: 13 }, (_, i): [number, number] => [5, 2 + i]),
  ...Array.from({ length: 16 }, (_, i): [number, number] => [5 + i, 14]),
];
const block: [number, number][] = [
  [32, 8],
  [33, 8],
  [34, 8],
];

describe('buildStitchPlan', () => {
  it('should never reveal the background', () => {
    const plan = buildStitchPlan(makeImage([...stroke, ...block]), WIDTH, HEIGHT);

    expect(plan.bin[at(0, 0)]).toBe(NO_BIN);
    expect(plan.alpha[at(0, 0)]).toBe(0);
    expect(plan.alpha[at(5, 5)]).toBe(255);
  });

  it('should start at the top of the stroke and follow it to the end', () => {
    const plan = buildStitchPlan(makeImage([...stroke, ...block]), WIDTH, HEIGHT);

    expect(plan.bin[at(5, 2)]).toBe(0);
    expect(plan.bin[at(5, 8)]).toBeLessThan(plan.bin[at(5, 14)]);
    expect(plan.bin[at(5, 14)]).toBeLessThan(plan.bin[at(20, 14)]);
  });

  it('should reveal unconnected lettering only after the connected stroke', () => {
    const plan = buildStitchPlan(makeImage([...stroke, ...block]), WIDTH, HEIGHT);

    expect(plan.bin[at(32, 8)]).toBeGreaterThan(plan.bin[at(20, 14)]);
    expect(plan.bin[at(32, 8)]).toBeLessThan(plan.bin[at(34, 8)]);
  });

  it('should list every visible pixel once, grouped by step', () => {
    const plan = buildStitchPlan(makeImage([...stroke, ...block]), WIDTH, HEIGHT);
    const visible = plan.alpha.filter((value) => value > 0).length;

    expect(plan.order).toHaveLength(visible);
    expect(plan.binStart[plan.bins]).toBe(visible);

    for (let b = 0; b < plan.bins; b++) {
      for (let k = plan.binStart[b]; k < plan.binStart[b + 1]; k++) {
        expect(plan.bin[plan.order[k]]).toBe(b);
      }
    }
  });

  it('should return an empty plan for an image without strokes', () => {
    const plan = buildStitchPlan(makeImage([]), WIDTH, HEIGHT);

    expect(plan.order).toHaveLength(0);
  });

  it('should finish the lilac thread before the navy letters that touch it', () => {
    const thread: [number, number][] = Array.from({ length: 12 }, (_, i): [number, number] => [10, 2 + i]);
    const letter: [number, number][] = Array.from({ length: 10 }, (_, i): [number, number] => [11 + i, 4]);
    const lateThread: [number, number][] = Array.from({ length: 6 }, (_, i): [number, number] => [10, 14 + i]);
    const image = makeImage(letter, NAVY, makeImage([...thread, ...lateThread], LILAC));
    const plan = buildStitchPlan(image, WIDTH, HEIGHT, { minStroke: 1 });

    expect(plan.bin[at(10, 2)]).toBe(0);
    expect(plan.bin[at(11, 4)]).toBeGreaterThan(plan.bin[at(10, 13)]);
    expect(plan.bin[at(11, 4)]).toBeLessThan(plan.bin[at(20, 4)]);
  });

  it('should drop faint specks that belong to no stroke', () => {
    const image = makeImage(stroke);
    const speck = at(30, 3) * 4;

    image[speck] = image[speck + 1] = image[speck + 2] = 215;

    const plan = buildStitchPlan(image, WIDTH, HEIGHT);

    expect(plan.alpha[at(30, 3)]).toBe(0);
    expect(plan.bin[at(30, 3)]).toBe(NO_BIN);
  });

  it('should fold a tiny fringe fragment into the stroke it touches', () => {
    const thread: [number, number][] = Array.from({ length: 12 }, (_, i): [number, number] => [10, 2 + i]);
    const fringe: [number, number][] = [[11, 8], [12, 8]];
    const image = makeImage(fringe, NAVY, makeImage(thread, LILAC));
    const plan = buildStitchPlan(image, WIDTH, HEIGHT);

    expect(plan.bin[at(11, 8)]).toBeLessThan(plan.bin[at(10, 13)] + 40);
    expect(plan.bin[at(12, 8)]).not.toBe(NO_BIN);
  });
});
