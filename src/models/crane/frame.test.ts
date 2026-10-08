import { describe, expect, it } from 'vitest';
import { CONTAINER_TYPES, type ContainerType } from '../container';
import { boxesOverlap, frameParts, hangingParts, shiftZ, trolleyParts } from './frame';
import { SPREADER, craneSpec } from './spec';

/**
 * The spreader, headblock and any load must never touch the crane's own structure anywhere in
 * their travel: every trolley position, every hoist height, both spreader lengths, every container.
 */
describe.each([
  { bays: 10, rows: 6, tiers: 5 },
  { bays: 4, rows: 3, tiers: 2 },
  { bays: 12, rows: 9, tiers: 7 },
])('crane clearance for a %o block', (cfg) => {
  const spec = craneSpec(cfg);
  const frame = frameParts(spec);

  const loads: (ContainerType | undefined)[] = [undefined, ...CONTAINER_TYPES];
  const cases: { z: number; y: number; len: number; load?: ContainerType }[] = [];
  const zs = [spec.trolley.min, (spec.trolley.min + spec.trolley.max) / 2, spec.trolley.max];
  const ys = [spec.hoist.min, spec.hoist.max / 2, spec.hoist.max];
  for (const z of zs) for (const y of ys) for (const load of loads) {
    const lens = load ? [load === '20GP' ? SPREADER.minLength : SPREADER.maxLength] : [SPREADER.minLength, SPREADER.maxLength];
    for (const len of lens) cases.push({ z, y, len, load });
  }

  it('hanging parts never touch the frame or the trolley and cab', () => {
    const clashes: string[] = [];
    for (const c of cases) {
      const hanging = hangingParts(c.y, c.len, c.load).map((b) => shiftZ(b, c.z));
      const trolley = trolleyParts(spec).map((b) => shiftZ(b, c.z));
      for (const h of hanging) {
        for (const part of [...frame, ...trolley]) {
          if (boxesOverlap(h, part)) clashes.push(`${h.name} hits ${part.name} at trolley ${c.z.toFixed(1)}, hoist ${c.y.toFixed(1)}, spreader ${c.len.toFixed(1)}, load ${c.load ?? 'none'}`);
        }
      }
    }
    expect(clashes).toEqual([]);
  });

  it('the cab never touches the frame anywhere along the trolley travel', () => {
    const clashes: string[] = [];
    for (const z of zs) {
      for (const t of trolleyParts(spec).filter((p) => p.name.startsWith('cab'))) {
        for (const part of frame.filter((p) => p.name !== 'girder' && p.name !== 'rail')) {
          if (boxesOverlap(shiftZ(t, z), part)) clashes.push(`${t.name} hits ${part.name} at trolley ${z}`);
        }
      }
    }
    expect(clashes).toEqual([]);
  });
});
