(() => {
// Small, deterministic models shared by the illustrations and their checks.
// Coordinates and time use illustrative units; these are not fitted datasets.
const SAMPLE = Object.freeze({ left: 120, right: 460, top: 66, bottom: 290 });

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function lightBasis(width, height, sources, wavelength) {
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

function makeScatterers(density, seed, radius = 8) {
  const random = seededRandom(seed);
  const particles = [];
  const target = Math.round(density * 0.55);
  for (let attempt = 0; particles.length < target && attempt < 10000; attempt += 1) {
    const x = SAMPLE.left + radius + 8 + random() * (340 - 2 * radius - 16);
    const y = SAMPLE.top + radius + 8 + random() * (224 - 2 * radius - 16);
    if (particles.some(p => Math.hypot(p.x - x, p.y - y) < p.radius + radius + 5)) continue;
    particles.push({ x, y, radius, id: particles.length });
  }
  return particles;
}

function scatteringBatch(density, seed, count = 48, radius = 8, particles = makeScatterers(density, seed, radius)) {
  const random = seededRandom(seed ^ 0xb125);
  const paths = [];
  for (let ray = 0; ray < count; ray += 1) {
    let x = SAMPLE.left;
    let y = 178 + (random() - 0.5) * 60;
    let dx = 1;
    let dy = 0;
    let distance = SAMPLE.left - 66;
    const points = [{ x: 66, y, distance: 0 }, { x, y, distance }];
    let exit = 'inside';
    for (let event = 0; event < 192; event += 1) {
      const toX = Math.abs(dx) > 1e-12 ? ((dx > 0 ? SAMPLE.right : SAMPLE.left) - x) / dx : Infinity;
      const toY = Math.abs(dy) > 1e-12 ? ((dy > 0 ? SAMPLE.bottom : SAMPLE.top) - y) / dy : Infinity;
      const boundary = Math.min(toX, toY);
      let nearest = boundary;
      let hit = null;
      for (const particle of particles) {
        const ox = x - particle.x;
        const oy = y - particle.y;
        const projection = ox * dx + oy * dy;
        const discriminant = projection * projection - (ox * ox + oy * oy - particle.radius ** 2);
        if (discriminant < 0) continue;
        const t = -projection - Math.sqrt(discriminant);
        if (t > 1e-6 && t < nearest) { nearest = t; hit = particle; }
      }
      x += dx * nearest;
      y += dy * nearest;
      distance += nearest;
      if (!hit) {
        points.push({ x, y, distance });
        exit = toX <= toY ? (dx > 0 ? 'forward' : 'back') : 'side';
        break;
      }
      points.push({ x, y, distance, particleId: hit.id });
      const normalLength = Math.hypot(x - hit.x, y - hit.y);
      const nx = (x - hit.x) / normalLength;
      const ny = (y - hit.y) / normalLength;
      const normalComponent = dx * nx + dy * ny;
      dx -= 2 * normalComponent * nx;
      dy -= 2 * normalComponent * ny;
      const directionLength = Math.hypot(dx, dy);
      dx /= directionLength;
      dy /= directionLength;
    }
    paths.push({ points, distance, exit });
  }
  return paths;
}

function scatteringCounts(paths, distance) {
  const counts = { forward: 0, back: 0, side: 0, inside: 0 };
  for (const path of paths) {
    if (path.distance <= distance && path.exit !== 'inside') counts[path.exit] += 1;
    else counts.inside += 1;
  }
  return counts;
}

  globalThis.PortfolioPhysics = Object.freeze({ SAMPLE, seededRandom, lightBasis, makeScatterers, scatteringBatch, scatteringCounts });
})();
