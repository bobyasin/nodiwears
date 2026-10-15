/** Marks a pixel that is never revealed (background). */
export const NO_BIN = 0xffff;

const BACKGROUND_LUMA = 236;
const SOFT_EDGE_LUMA = 170;
const CORE_LUMA = 190;
/** Share of ink a pixel needs to count as part of a stroke (and to tell its colour). */
const CORE_STRENGTH = 0.35;
/** Ink with less colour than this (max - min channel) is grey, like the needle. */
const GREY_CHROMA = 30;
/** Thread (red, lilac) has more red than green in it; the navy lettering has more green. */
const THREAD_LEAN = -12;
const THREAD = 2;
/** How far apart two strokes may be and still count as touching. */
const TOUCH_RADIUS = 2;

export interface StitchOptions {
  /** Number of animation steps the reveal is split into. */
  bins?: number;
  /** Fragments (in pixels) smaller than this that touch a stroke are folded into it: colour fringing. */
  minStroke?: number;
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
 * The logo is split into strokes: connected runs of ink of one colour (needle, thread,
 * each letter). The first dark pixel from the top (the needle tip) starts the first
 * stroke. Every following stroke starts where it touches what is already stitched
 * (thread before letters, then left to right), or at its top-left corner if it touches
 * nothing, and is revealed along its length at a constant speed.
 */
export function buildStitchPlan(
  rgba: ArrayLike<number>,
  width: number,
  height: number,
  { bins = 600, minStroke = 24 }: StitchOptions = {},
): StitchPlan {
  const size = width * height;
  const alpha = new Uint8ClampedArray(size);
  const strength = new Float32Array(size);
  const bin = new Uint16Array(size).fill(NO_BIN);
  let seed = -1;
  let background = [0, 0, 0];
  let backgroundCount = 0;

  for (let i = 0; i < size; i++) {
    const luma = 0.299 * rgba[i * 4] + 0.587 * rgba[i * 4 + 1] + 0.114 * rgba[i * 4 + 2];

    strength[i] = Math.min(1, Math.max(0, (BACKGROUND_LUMA - luma) / (BACKGROUND_LUMA - SOFT_EDGE_LUMA)));
    alpha[i] = Math.round(strength[i] * 255);

    if (alpha[i] === 0) {
      background = background.map((sum, c) => sum + rgba[i * 4 + c]);
      backgroundCount++;
    }

    if (seed < 0 && luma < CORE_LUMA) {
      seed = i;
    }
  }

  const fabric = background.map((sum) => (backgroundCount ? sum / backgroundCount : 255));

  // Ink colour class of every solid pixel: 0 grey (needle), 1 dark blue (letters), 2 light colour (thread).
  const inkClass = new Int8Array(size).fill(-1);

  for (let i = 0; i < size; i++) {
    if (strength[i] < CORE_STRENGTH) {
      continue;
    }

    // Unmix the ink from the fabric it is blended with at soft edges.
    const ink = [0, 1, 2].map((c) => (rgba[i * 4 + c] - (1 - strength[i]) * fabric[c]) / strength[i]);
    const chroma = Math.max(...ink) - Math.min(...ink);

    inkClass[i] = chroma < GREY_CHROMA ? 0 : ink[1] - ink[0] <= THREAD_LEAN ? THREAD : 1;
  }

  // Strokes: connected solid pixels of one class.
  const stroke = new Int32Array(size).fill(-1);
  const members: number[][] = [];
  const queue = new Int32Array(size);

  const neighbours = (index: number, radius: number, visit: (next: number) => void) => {
    const x = index % width;
    const y = (index - x) / width;

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = x + dx;
        const ny = y + dy;

        if (nx >= 0 && ny >= 0 && nx < width && ny < height) {
          visit(ny * width + nx);
        }
      }
    }
  };

  for (let start = 0; start < size; start++) {
    if (inkClass[start] < 0 || stroke[start] >= 0) {
      continue;
    }

    const id = members.length;
    const list: number[] = [];
    let head = 0;
    let tail = 0;

    stroke[start] = id;
    queue[tail++] = start;

    while (head < tail) {
      const index = queue[head++];

      list.push(index);
      neighbours(index, 1, (next) => {
        if (stroke[next] < 0 && inkClass[next] === inkClass[start]) {
          stroke[next] = id;
          queue[tail++] = next;
        }
      });
    }

    members.push(list);
  }

  // Soft edge pixels join the nearest stroke; faint specks of fabric texture are dropped.
  let head = 0;
  let tail = 0;

  for (const list of members) {
    for (const index of list) {
      queue[tail++] = index;
    }
  }

  while (head < tail) {
    const index = queue[head++];

    neighbours(index, 1, (next) => {
      if (stroke[next] < 0 && alpha[next] > 0) {
        stroke[next] = stroke[index];
        members[stroke[index]].push(next);
        queue[tail++] = next;
      }
    });
  }

  for (let i = 0; i < size; i++) {
    if (stroke[i] < 0) {
      alpha[i] = 0;
    }
  }

  // Tiny fragments next to a real stroke are colour fringing, not strokes of their own.
  for (let id = 0; id < members.length; id++) {
    if (members[id].length === 0 || members[id].length >= minStroke) {
      continue;
    }

    const votes = new Map<number, number>();

    for (const index of members[id]) {
      neighbours(index, TOUCH_RADIUS, (next) => {
        const other = stroke[next];

        if (other >= 0 && other !== id && members[other].length > members[id].length) {
          votes.set(other, (votes.get(other) ?? 0) + 1);
        }
      });
    }

    const target = [...votes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

    if (target !== undefined) {
      for (const index of members[id]) {
        stroke[index] = target;
        members[target].push(index);
      }

      members[id] = [];
    }
  }

  const kept = members.map((list) => list.length > 0);
  const renumber = new Int32Array(members.length);

  members.forEach((_, id) => {
    renumber[id] = kept.slice(0, id).filter(Boolean).length;
  });

  for (let i = 0; i < size; i++) {
    if (stroke[i] >= 0) {
      stroke[i] = renumber[stroke[i]];
    }
  }

  members.splice(0, members.length, ...members.filter((list) => list.length > 0));

  // Duration of each stroke is its length: the longest walk along it from where it starts.
  const walk = new Int32Array(size).fill(-1);
  const length = new Int32Array(members.length);
  const entry = new Int32Array(members.length).fill(-1);
  const walked: number[][] = members.map(() => []);

  function trace(id: number, from: number) {
    let first = 0;
    let last = 0;

    queue[last++] = from;
    walk[from] = 0;
    entry[id] = from;

    while (first < last) {
      const index = queue[first++];

      walked[id].push(index);
      length[id] = Math.max(length[id], walk[index]);
      neighbours(index, TOUCH_RADIUS, (next) => {
        if (walk[next] < 0 && stroke[next] === id) {
          walk[next] = walk[index] + 1;
          queue[last++] = next;
        }
      });
    }
  }

  const left = members.map((list) => list.reduce((min, index) => Math.min(min, index % width), width));
  const adjacent: Set<number>[] = members.map(() => new Set());

  for (let id = 0; id < members.length; id++) {
    for (const index of members[id]) {
      neighbours(index, TOUCH_RADIUS, (next) => {
        if (stroke[next] >= 0 && stroke[next] !== id) {
          adjacent[id].add(stroke[next]);
        }
      });
    }
  }

  const done = new Uint8Array(members.length);
  const sequence: number[] = [];

  /** Cheapest way into a stroke from stitched pixels: the touching pixel stitched earliest. */
  function contactPoint(id: number): number {
    let best = -1;
    let bestStep = Infinity;

    for (const index of members[id]) {
      neighbours(index, TOUCH_RADIUS, (next) => {
        if (walk[next] >= 0 && stroke[next] !== id && stepOf(next) < bestStep) {
          bestStep = stepOf(next);
          best = index;
        }
      });
    }

    return best;
  }

  // Position of a pixel along the overall sequence, used to pick contact points.
  const stitchedAt = new Float64Array(size).fill(-1);
  const stepOf = (index: number) => stitchedAt[index];
  let clock = 0;

  function enter(id: number, from: number) {
    trace(id, from);
    done[id] = 1;
    sequence.push(id);

    for (const index of walked[id]) {
      stitchedAt[index] = clock + walk[index];
    }

    clock += length[id] + 1;
  }

  if (seed >= 0) {
    enter(stroke[seed], seed);
  }

  while (sequence.length < members.length && seed >= 0) {
    let next = -1;
    let touching = false;
    let nextRank = Infinity;

    for (let id = 0; id < members.length; id++) {
      if (done[id]) {
        continue;
      }

      const touches = [...adjacent[id]].some((other) => done[other]);
      const rank = (touches ? 0 : 2) + (inkClass[members[id][0]] === THREAD ? 0 : 1);

      if (next < 0 || rank < nextRank || (rank === nextRank && left[id] < left[next])) {
        next = id;
        nextRank = rank;
        touching = touches;
      }
    }

    if (touching) {
      enter(next, contactPoint(next));
    } else {
      // Nothing touches it: begin at the top-left corner of the stroke.
      let corner = members[next][0];

      for (const index of members[next]) {
        const x = index % width;
        const y = (index - x) / width;
        const cx = corner % width;
        const cy = (corner - cx) / width;

        if (y < cy || (y === cy && x < cx)) {
          corner = index;
        }
      }

      enter(next, corner);
    }
  }

  // Constant speed along the whole sequence.
  const total = Math.max(1, clock);

  for (let i = 0; i < size; i++) {
    if (alpha[i] > 0 && stitchedAt[i] >= 0) {
      bin[i] = Math.min(bins - 1, Math.floor((stitchedAt[i] / total) * bins));
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
