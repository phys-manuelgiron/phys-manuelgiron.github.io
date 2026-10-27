import test from 'node:test';
import assert from 'node:assert/strict';
import { SAMPLE, scatteringBatch, scatteringCounts, lightBasis } from '../physics.js';

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

test('the unscattered fraction follows exponential free-flight survival', () => {
  let unscattered = 0;
  const ensembles = 300;
  for (let seed = 0; seed < ensembles; seed += 1) {
    unscattered += scatteringBatch(10, seed).filter(path => path.points.length === 3 && path.exit === 'forward').length;
  }
  const expected = Math.exp(-(SAMPLE.right - SAMPLE.left) / 160);
  assert(Math.abs(unscattered / (ensembles * 48) - expected) < 0.015);
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
