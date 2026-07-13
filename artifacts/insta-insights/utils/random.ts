// Deterministic seeded PRNG so the same link always analyzes to the same
// baseline numbers (until the user edits them by hand).

function xmur3(str: string) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createRng(seed: string) {
  const seedFn = xmur3(seed);
  const rng = mulberry32(seedFn());

  return {
    next: () => rng(),
    range: (min: number, max: number) => min + rng() * (max - min),
    int: (min: number, max: number) => Math.floor(min + rng() * (max - min + 1)),
  };
}

export function newId() {
  return Date.now().toString() + Math.random().toString(36).slice(2, 9);
}
