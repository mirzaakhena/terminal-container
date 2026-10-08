import { describe, expect, it } from 'vitest';
import { CONTAINER_SPECS, fittingCentres, type ContainerType } from '../container';
import { canPlace, placements, planLoad, twistlockPositions, type TrailerLoad } from './loads';
import { TRAILER } from './spec';

const legalLoads: [string, ContainerType[]][] = [
  ['one 20ft', ['20GP']],
  ['two 20ft', ['20GP', '20GP']],
  ['one 40ft', ['40GP']],
  ['one 40ft High Cube', ['40HC']],
];

const loadOf = (types: ContainerType[]): TrailerLoad => {
  const r = planLoad(types);
  if (!r.ok) throw new Error(r.reason);
  return r.load;
};

describe('trailer loads', () => {
  it('empty trailer is a valid load', () => {
    expect(planLoad([])).toEqual({ ok: true, load: {} });
  });

  it.each(legalLoads)('%s: every corner casting sits on a twistlock', (_, types) => {
    const locks = twistlockPositions();
    for (const p of placements(loadOf(types))) {
      for (const [fx, fz] of fittingCentres(p.type)) {
        // Containers ride doors-to-the-rear, i.e. rotated 180°, which maps (x, z) to (-x, -z).
        const x = p.x - fx;
        const z = -fz;
        const nearest = Math.min(...locks.map(([lx, lz]) => Math.hypot(lx - x, lz - z)));
        expect(nearest).toBeLessThan(0.005);
      }
    }
  });

  it.each(legalLoads)('%s: containers stay on the deck and do not overlap', (_, types) => {
    const spans = placements(loadOf(types))
      .map((p) => [p.x - CONTAINER_SPECS[p.type].length / 2, p.x + CONTAINER_SPECS[p.type].length / 2])
      .sort((a, b) => a[0] - b[0]);
    for (const [lo, hi] of spans) {
      expect(lo).toBeGreaterThanOrEqual(TRAILER.rearX);
      expect(hi).toBeLessThanOrEqual(TRAILER.frontX);
    }
    for (let i = 1; i < spans.length; i++) expect(spans[i][0]).toBeGreaterThan(spans[i - 1][1]);
  });

  it('single 20ft goes in the centre position', () => {
    expect(loadOf(['20GP'])).toEqual({ centre20: '20GP' });
  });

  it.each([
    [['20GP', '20GP', '20GP']],
    [['40GP', '20GP']],
    [['40GP', '40HC']],
  ] as ContainerType[][][])('refuses %j with a reason', (types) => {
    const r = planLoad(types);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/40ft trailer carries/);
  });

  it('refuses a container of the wrong length for a slot', () => {
    const r = canPlace({}, 'full40', '20GP');
    expect(r.ok).toBe(false);
  });

  it('refuses overlapping slots', () => {
    expect(canPlace({ centre20: '20GP' }, 'front20', '20GP').ok).toBe(false);
    expect(canPlace({ full40: '40HC' }, 'rear20', '20GP').ok).toBe(false);
    expect(canPlace({ front20: '20GP' }, 'front20', '20GP').ok).toBe(false);
  });

  it('allows building a 20ft pair one container at a time', () => {
    expect(canPlace({}, 'rear20', '20GP').ok).toBe(true);
    expect(canPlace({ rear20: '20GP' }, 'front20', '20GP').ok).toBe(true);
  });
});
