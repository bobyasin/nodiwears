import { describe, expect, it } from 'vitest';

import { buildStitchPlan, NO_BIN } from './stitch';

const WIDTH = 40;
const HEIGHT = 20;

function makeImage(dark: readonly (readonly [number, number])[]): Uint8ClampedArray {
  const data = new Uint8ClampedArray(WIDTH * HEIGHT * 4).fill(250);

  for (const [x, y] of dark) {
    const offset = (y * WIDTH + x) * 4;

    data[offset] = 20;
    data[offset + 1] = 30;
    data[offset + 2] = 60;
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
});
