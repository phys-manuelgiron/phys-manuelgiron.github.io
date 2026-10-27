// Small, deterministic models shared by the illustrations and their checks.
// Coordinates and time use illustrative units; these are not fitted datasets.
export const SAMPLE = Object.freeze({ left: 120, right: 460, top: 66, bottom: 290 });

export function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function lightBasis(width, height, sources, wavelength) {
  const cosine = new Float32Array(width * height);
  const sine = new Float32Array(width * height);
  const k = 2 * Math.PI / wavelength;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      for (const source of sources) {
        const r = Math.hypot((x / width - source.x) * 600, (y / height - source.y) * 360);
        const amplitude = 0.95 / Math.sqrt(1 + r / 100) / sources.length;
        cosine[index] += amplitude * Math.cos(k * r);
        sine[index] += amplitude * Math.sin(k * r);
      }
    }
  }
  return { cosine, sine };
}

export function scatteringBatch(density, seed, count = 48) {
  const random = seededRandom(seed);
  const meanFreePath = density > 0 ? 1600 / density : Infinity;
  const paths = [];
  for (let ray = 0; ray < count; ray += 1) {
    let x = SAMPLE.left;
    let y = 178 + (random() - 0.5) * 24;
    let angle = 0;
    let distance = SAMPLE.left - 66;
    const points = [{ x: 66, y, distance: 0 }, { x, y, distance }];
    let exit = 'inside';
    for (let event = 0; event < 512; event += 1) {
      const dx = Math.cos(angle);
      const dy = Math.sin(angle);
      const xEdge = dx > 0 ? SAMPLE.right : SAMPLE.left;
      const yEdge = dy > 0 ? SAMPLE.bottom : SAMPLE.top;
      const toX = Math.abs(dx) > 1e-12 ? (xEdge - x) / dx : Infinity;
      const toY = Math.abs(dy) > 1e-12 ? (yEdge - y) / dy : Infinity;
      const boundary = Math.min(toX, toY);
      const freePath = -meanFreePath * Math.log(1 - Math.max(Number.EPSILON, random()));
      const step = Math.min(freePath, boundary);
      x += dx * step;
      y += dy * step;
      distance += step;
      points.push({ x, y, distance });
      if (boundary <= freePath) {
        exit = toX <= toY ? (dx > 0 ? 'forward' : 'back') : 'side';
        break;
      }
      angle = random() * Math.PI * 2;
    }
    paths.push({ points, distance, exit });
  }
  return paths;
}

export function scatteringCounts(paths, distance) {
  const counts = { forward: 0, back: 0, side: 0, inside: 0 };
  for (const path of paths) {
    if (path.distance <= distance && path.exit !== 'inside') counts[path.exit] += 1;
    else counts.inside += 1;
  }
  return counts;
}
