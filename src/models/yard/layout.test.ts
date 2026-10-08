import { describe, expect, it } from 'vitest';
import { CONTAINER_SPECS } from '../container';
import {
  BAY_PITCH, canPlace, containersOnTop, createBlock, demoFill, place, remove, slotPosition, validBays,
  type BlockState, type BlockContainer,
} from './layout';

const cfg = { bays: 6, rows: 4, tiers: 3 };
const must = (s: BlockState, c: Omit<BlockContainer, 'id'> & { id?: string }) => {
  const r = place(s, c);
  if (!r.ok) throw new Error(r.reason);
  return r.value;
};
const reason = (r: { ok: boolean; reason?: string }) => (r.ok ? 'ok' : r.reason);

describe('block addresses', () => {
  it('20ft use odd bays, 40ft use 02, 06, 10 …', () => {
    expect(validBays(cfg, '20GP')).toEqual([1, 3, 5, 7, 9, 11]);
    expect(validBays(cfg, '40GP')).toEqual([2, 6, 10]);
  });

  it('a 40ft slot spans two 20ft bays and fits inside them', () => {
    const s = createBlock(cfg);
    const [x40] = slotPosition(s, '40GP', { bay: 2, row: 1, tier: 1 });
    const [x1] = slotPosition(s, '20GP', { bay: 1, row: 1, tier: 1 });
    const [x3] = slotPosition(s, '20GP', { bay: 3, row: 1, tier: 1 });
    expect(x40).toBeCloseTo((x1 + x3) / 2, 6);
    expect(2 * BAY_PITCH).toBeGreaterThan(CONTAINER_SPECS['40GP'].length);
    expect(BAY_PITCH).toBeGreaterThan(CONTAINER_SPECS['20GP'].length);
  });
});

describe('placing containers', () => {
  it('places on the ground and stacks', () => {
    let s = must(createBlock(cfg), { id: 'A', type: '20GP', bay: 1, row: 1, tier: 1 });
    s = must(s, { id: 'B', type: '20GP', bay: 1, row: 1, tier: 2 });
    expect(slotPosition(s, '20GP', { bay: 1, row: 1, tier: 3 })[1]).toBeCloseTo(2 * CONTAINER_SPECS['20GP'].height, 6);
  });

  it('stack height follows High Cubes below', () => {
    const s = must(createBlock(cfg), { id: 'H', type: '40HC', bay: 2, row: 1, tier: 1 });
    expect(slotPosition(s, '40GP', { bay: 2, row: 1, tier: 2 })[1]).toBeCloseTo(CONTAINER_SPECS['40HC'].height, 6);
  });

  it('refuses mid-air, occupied, over the limit and outside the block', () => {
    let s = createBlock(cfg);
    expect(reason(canPlace(s, '20GP', { bay: 1, row: 1, tier: 2 }))).toMatch(/mid-air/);
    s = must(s, { id: 'A', type: '20GP', bay: 1, row: 1, tier: 1 });
    expect(reason(canPlace(s, '20GP', { bay: 1, row: 1, tier: 1 }))).toMatch(/already taken by A/);
    expect(reason(canPlace(s, '40GP', { bay: 2, row: 1, tier: 1 }))).toMatch(/already taken by A/);
    expect(reason(canPlace(s, '20GP', { bay: 1, row: 1, tier: 4 }))).toMatch(/above this block's limit/);
    expect(reason(canPlace(s, '20GP', { bay: 13, row: 1, tier: 1 }))).toMatch(/outside/);
    expect(reason(canPlace(s, '20GP', { bay: 1, row: 5, tier: 1 }))).toMatch(/outside/);
    expect(reason(canPlace(s, '20GP', { bay: 2, row: 1, tier: 1 }))).toMatch(/odd bay/);
    expect(reason(canPlace(s, '40GP', { bay: 4, row: 1, tier: 1 }))).toMatch(/02, 06/);
  });

  it('refuses 20ft on 40ft and 40ft on 20ft', () => {
    let s = must(createBlock(cfg), { id: 'F', type: '40GP', bay: 2, row: 1, tier: 1 });
    expect(reason(canPlace(s, '20GP', { bay: 1, row: 1, tier: 2 }))).toMatch(/cannot stand on a 40ft/);
    s = must(s, { id: 'a', type: '20GP', bay: 5, row: 1, tier: 1 });
    s = must(s, { id: 'b', type: '20GP', bay: 7, row: 1, tier: 1 });
    expect(reason(canPlace(s, '40GP', { bay: 6, row: 1, tier: 2 }))).toMatch(/cannot stand on 20ft/);
  });

  it('a 40ft half over an empty bay is mid-air', () => {
    const s = must(createBlock(cfg), { id: 'a', type: '20GP', bay: 1, row: 1, tier: 1 });
    expect(reason(canPlace(s, '40GP', { bay: 2, row: 1, tier: 2 }))).toMatch(/mid-air|cannot stand/);
  });
});

describe('removing containers', () => {
  it('refuses to take out a buried container', () => {
    let s = must(createBlock(cfg), { id: 'A', type: '20GP', bay: 1, row: 1, tier: 1 });
    s = must(s, { id: 'B', type: '20GP', bay: 1, row: 1, tier: 2 });
    expect(containersOnTop(s, 'A').map((c) => c.id)).toEqual(['B']);
    expect(reason(remove(s, 'A'))).toMatch(/buried under B/);
    const r = remove(s, 'B');
    expect(r.ok).toBe(true);
  });
});

describe('demo fill', () => {
  it('produces a valid, partly filled block with mixed sizes', () => {
    const big = { bays: 10, rows: 6, tiers: 5 };
    const s = demoFill(big);
    const all = Object.values(s.containers);
    const capacity = big.bays * big.rows * big.tiers;
    expect(all.length).toBeGreaterThan(capacity * 0.2);
    expect(all.length).toBeLessThan(capacity * 0.9);
    expect(new Set(all.map((c) => CONTAINER_SPECS[c.type].nominalFeet))).toEqual(new Set([20, 40]));
    // Rebuilding the same containers one by one in tier order must be accepted.
    let rebuilt = createBlock(big);
    for (const c of [...all].sort((a, b) => a.tier - b.tier)) rebuilt = must(rebuilt, c);
    expect(Object.keys(rebuilt.containers).length).toBe(all.length);
  });

  it('is deterministic', () => {
    const a = Object.values(demoFill(cfg, 3).containers).map((c) => [c.type, c.bay, c.row, c.tier]);
    const b = Object.values(demoFill(cfg, 3).containers).map((c) => [c.type, c.bay, c.row, c.tier]);
    expect(a).toEqual(b);
  });
});
