/** Marks a pixel that is never revealed (background). */
export const NO_BIN = 0xffff;

const BACKGROUND_LUMA = 236;
const SOFT_EDGE_LUMA = 170;
const CORE_LUMA = 190;

export interface StitchOptions {
  /** Number of animation steps the reveal is split into. */
  bins?: number;
  /** Share of the timeline spent following the thread; the rest reveals loose lettering. */
  monogramShare?: number;
  /** Pause, as a share of the timeline, between the thread and the lettering. */
  gap?: number;
}

export interface StitchPlan {
  width: number;
  height: number;
  bins: number;
  /** Final opacity of every pixel (0 for background, soft at stroke edges). */
  alpha: Uint8ClampedArray;
  /** Step at which each pixel appears, or NO_BIN. */
  bin: Uint16Array;
  /** Pixel indices sorted by the step they appear in. */
  order: Uint32Array;
  /** order[binStart[b]..binStart[b + 1]) are the pixels revealed in step b. */
  binStart: Uint32Array;
}

/**
 * Turns an embroidery logo into a "being stitched" timeline.
 *
 * The first dark pixel from the top (the needle tip) is the seed. The reveal then
 * follows the connected strokes (needle, thread, letters) by distance from the seed,
 * and any strokes that are not connected to it (a wordmark) appear afterwards from
 * left to right.
 */
export function buildStitchPlan(
  rgba: ArrayLike<number>,
  width: number,
  height: number,
  { bins = 600, monogramShare = 0.72, gap = 0.03 }: StitchOptions = {},
): StitchPlan {
  const size = width * height;
  const luma = new Float32Array(size);
  const alpha = new Uint8ClampedArray(size);
  const bin = new Uint16Array(size).fill(NO_BIN);
  let seed = -1;

  for (let i = 0; i < size; i++) {
    luma[i] = 0.299 * rgba[i * 4] + 0.587 * rgba[i * 4 + 1] + 0.114 * rgba[i * 4 + 2];
    const strength = (BACKGROUND_LUMA - luma[i]) / (BACKGROUND_LUMA - SOFT_EDGE_LUMA);
    alpha[i] = Math.round(Math.min(1, Math.max(0, strength)) * 255);

    if (seed < 0 && luma[i] < CORE_LUMA) {
      seed = i;
    }
  }

  const dist = new Int32Array(size).fill(-1);
  let maxDist = 0;

  if (seed >= 0) {
    const queue = new Int32Array(size);
    let head = 0;
    let tail = 0;

    dist[seed] = 0;
    queue[tail++] = seed;

    while (head < tail) {
      const index = queue[head++];
      const x = index % width;
      const y = (index - x) / width;

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;

          if (nx < 0 || ny < 0 || nx >= width || ny >= height) {
            continue;
          }

          const next = ny * width + nx;

          if (alpha[next] > 0 && dist[next] < 0) {
            dist[next] = dist[index] + 1;
            maxDist = Math.max(maxDist, dist[next]);
            queue[tail++] = next;
          }
        }
      }
    }
  }

  let minX = width;
  let maxX = 0;

  for (let i = 0; i < size; i++) {
    if (alpha[i] === 0) {
      continue;
    }

    if (dist[i] >= 0) {
      const progress = maxDist === 0 ? 0 : dist[i] / maxDist;

      bin[i] = Math.min(bins - 1, Math.floor(progress * monogramShare * bins));
    } else {
      const x = i % width;

      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
    }
  }

  const lettersStart = monogramShare + gap;

  for (let i = 0; i < size; i++) {
    if (alpha[i] > 0 && dist[i] < 0) {
      const across = (i % width - minX) / Math.max(1, maxX - minX);

      bin[i] = Math.min(bins - 1, Math.floor((lettersStart + (1 - lettersStart) * across) * bins));
    }
  }

  const binStart = new Uint32Array(bins + 1);

  for (let i = 0; i < size; i++) {
    if (bin[i] !== NO_BIN) {
      binStart[bin[i] + 1]++;
    }
  }

  for (let b = 0; b < bins; b++) {
    binStart[b + 1] += binStart[b];
  }

  const order = new Uint32Array(binStart[bins]);
  const cursor = binStart.slice(0, bins);

  for (let i = 0; i < size; i++) {
    if (bin[i] !== NO_BIN) {
      order[cursor[bin[i]]++] = i;
    }
  }

  return { width, height, bins, alpha, bin, order, binStart };
}
