import * as pr from '../src/playground-rotations.js';

describe('playground rotation/index mapping', () => {
  [3, 4, 5, 6, 7, 8, 9, 10].forEach((count) => {
    describe(`count=${count}`, () => {
      for (let i = 0; i < count; i++) {
        test(`index ${i} round-trip`, () => {
          const mid = pr.targetMidDegForIndex(count, i);
          const rot = pr.rotationToBringMidToPointer(mid);
          const normalized = pr.normalizeDeg(rot);
          const recovered = pr.indexFromRenderedRotation(normalized, count);
          expect(recovered).toBe(i);
        });
      }
    });
  });
});
