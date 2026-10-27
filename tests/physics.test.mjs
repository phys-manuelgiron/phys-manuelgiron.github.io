import test from 'node:test';
import assert from 'node:assert/strict';
import '../physics.js';
const { SAMPLE, scatteringBatch, scatteringCounts, lightBasis, makeScatterers } = globalThis.PortfolioPhysics;

test('an empty sample transmits the complete pulse without scattering', () => {
  const paths = scatteringBatch(0, 123);
  assert.equal(paths.length, 48);
  assert.deepEqual(scatteringCounts(paths, Infinity), { forward: 48, back: 0, side: 0, inside: 0 });
  for (const path of paths) {
    assert.equal(path.points.length, 3);
    assert.equal(path.points[0].y, path.points.at(-1).y);
  }
});

test('rays reach the reported boundary and counts conserve the pulse', () => {
  for (const density of [5, 40, 100]) {
    for (let seed = 0; seed < 80; seed += 1) {
      const paths = scatteringBatch(density, seed);
      const final = scatteringCounts(paths, Infinity);
      assert.equal(Object.values(final).reduce((a, b) => a + b, 0), paths.length);
      assert.equal(final.inside, 0);
      assert.equal(scatteringCounts(paths, 0).inside, paths.length);
      for (const path of paths) {
        let previous = -1;
        for (const point of path.points) {
          assert(Number.isFinite(point.x) && Number.isFinite(point.y));
          assert(point.distance > previous);
          previous = point.distance;
        }
        const end = path.points.at(-1);
        if (path.exit === 'forward') assert(Math.abs(end.x - SAMPLE.right) < 1e-6);
        if (path.exit === 'back') assert(Math.abs(end.x - SAMPLE.left) < 1e-6);
        if (path.exit === 'side') assert(Math.min(Math.abs(end.y - SAMPLE.top), Math.abs(end.y - SAMPLE.bottom)) < 1e-6);
        for (const point of path.points.slice(1)) {
          assert(point.x >= SAMPLE.left - 1e-6 && point.x <= SAMPLE.right + 1e-6);
          assert(point.y >= SAMPLE.top - 1e-6 && point.y <= SAMPLE.bottom + 1e-6);
        }
      }
    }
  }
});

test('every change of direction is a reflection at a visible particle', () => {
  let collisions = 0;
  for (const radius of [4, 8, 13]) for (const density of [20, 60, 100]) {
    const particles = makeScatterers(density, 123, radius);
    for (const path of scatteringBatch(density, 123, 48, radius)) {
      for (let i = 2; i < path.points.length - 1; i += 1) {
        const point = path.points[i];
        assert.notEqual(point.particleId, undefined);
        const particle = particles[point.particleId];
        assert(Math.abs(Math.hypot(point.x - particle.x, point.y - particle.y) - particle.radius) < 1e-6);
        const previous = path.points[i - 1];
        const next = path.points[i + 1];
        const before = Math.hypot(point.x - previous.x, point.y - previous.y);
        const after = Math.hypot(next.x - point.x, next.y - point.y);
        const incoming = [(point.x - previous.x) / before, (point.y - previous.y) / before];
        const outgoing = [(next.x - point.x) / after, (next.y - point.y) / after];
        const normal = [(point.x - particle.x) / radius, (point.y - particle.y) / radius];
        const dot = incoming[0] * normal[0] + incoming[1] * normal[1];
        for (let axis = 0; axis < 2; axis += 1) assert(Math.abs(outgoing[axis] - (incoming[axis] - 2 * dot * normal[axis])) < 1e-6);
        collisions += 1;
      }
    }
  }
  assert(collisions > 50);
});

test('a sample is reproducible and new seeds change its paths', () => {
  assert.deepEqual(scatteringBatch(40, 123), scatteringBatch(40, 123));
  assert.notDeepEqual(scatteringBatch(40, 123), scatteringBatch(40, 456));
});

test('the field respects normalized superposition and stays finite', () => {
  const a = { x: 0.3, y: 0.43 };
  const b = { x: 0.68, y: 0.57 };
  for (const wavelength of [24, 48, 80]) {
    const first = lightBasis(30, 20, [a], wavelength);
    const second = lightBasis(30, 20, [b], wavelength);
    const combined = lightBasis(30, 20, [a, b], wavelength);
    for (const part of ['cosine', 'sine']) {
      for (let i = 0; i < combined[part].length; i += 1) {
        assert(Number.isFinite(combined[part][i]));
        assert(Math.abs(combined[part][i]) <= 1);
        assert(Math.abs(combined[part][i] - (first[part][i] + second[part][i]) / 2) < 1e-6);
      }
    }
  }
});
