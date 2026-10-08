import { describe, expect, it } from 'vitest';
import { CONTAINER_SPECS, HIGH_CUBE_HEIGHT } from '../container';
import { createBlock, place, slotPosition, type BlockState } from '../yard';
import { TRAILER } from '../truck/spec';
import type { World } from '../../sim/world';
import { CraneController } from './controller';
import { LANE_Z, SPEEDS, SPREADER, craneSpec } from './spec';

const cfg = { bays: 6, rows: 4, tiers: 3 };
const must = (s: BlockState, c: Parameters<typeof place>[1]) => {
  const r = place(s, c);
  if (!r.ok) throw new Error(r.reason);
  return r.value;
};

function setup() {
  let block = createBlock(cfg);
  block = must(block, { id: 'A', type: '20GP', bay: 1, row: 1, tier: 1 });
  block = must(block, { id: 'B', type: '20GP', bay: 1, row: 1, tier: 2 });
  block = must(block, { id: 'F', type: '40HC', bay: 6, row: 2, tier: 1 });
  const world: World = { block, trucks: [{ id: 'T1', x: 30, z: LANE_Z, load: {}, ids: {}, colors: {} }] };
  return new CraneController(craneSpec(cfg), world);
}

/** Run until the crane stops (or a time limit). Returns seconds taken. */
function settle(c: CraneController, limit = 300) {
  let t = 0;
  while (c.moving && t < limit) {
    c.step(1 / 30);
    t += 1 / 30;
  }
  return t;
}

const over = (c: CraneController, x: number, z: number) => {
  c.moveTo('hoist', c.spec.hoist.max);
  settle(c);
  c.moveTo('gantry', x);
  c.moveTo('trolley', z);
  settle(c);
};

describe('crane size', () => {
  it('spans the block plus the truck lane and clears a High Cube over the top tier', () => {
    const s = craneSpec(cfg);
    expect(s.legZ[0]).toBeLessThan(LANE_Z - 2);
    expect(s.trolley.min).toBeCloseTo(LANE_Z, 6);
    expect(s.hoist.max - HIGH_CUBE_HEIGHT).toBeGreaterThan(cfg.tiers * HIGH_CUBE_HEIGHT);
    expect(s.girderY).toBeGreaterThan(s.hoist.max + SPREADER.height);
    const wider = craneSpec({ ...cfg, rows: 7, tiers: 5 });
    expect(wider.span).toBeGreaterThan(s.span);
    expect(wider.girderY).toBeGreaterThan(s.girderY);
  });
});

describe('crane movement', () => {
  it('stops at its limits', () => {
    const c = setup();
    c.moveTo('trolley', -1000);
    c.moveTo('gantry', 1e6);
    settle(c, 600);
    expect(c.trolley.pos).toBeCloseTo(c.spec.trolley.min, 6);
    expect(c.gantry.pos).toBeCloseTo(c.spec.gantry.max, 6);
  });

  it('lowering stops on top of the stack, never through it', () => {
    const c = setup();
    const [x, y, z] = slotPosition(c.world.block, '20GP', { bay: 1, row: 1, tier: 3 });
    over(c, x, z);
    c.moveTo('hoist', 0);
    settle(c);
    expect(c.hoist.pos).toBeCloseTo(y, 6);
  });

  it('moves at believable speeds, not instantly', () => {
    const c = setup();
    const t = (() => { c.moveTo('gantry', c.gantry.pos + 22); return settle(c); })();
    expect(t).toBeGreaterThan(22 / SPEEDS.gantry.max);
    expect(t).toBeLessThan(30);
  });

  it('will not drive a low spreader sideways into a stack', () => {
    const c = setup();
    const [x, , z] = slotPosition(c.world.block, '20GP', { bay: 3, row: 1, tier: 1 });
    over(c, x, z);
    c.moveTo('hoist', 0.5);
    settle(c);
    c.moveTo('gantry', x - 6.5); // towards the 2-high stack at bay 01
    settle(c);
    expect(c.gantry.pos).toBeGreaterThan(x - 6.5 + 1);
    expect(c.blocked).toMatch(/Raise the spreader/);
  });
});

describe('spreader', () => {
  it('telescopes between 20ft and 40ft', () => {
    const c = setup();
    expect(c.setSpreader(40).ok).toBe(true);
    const t = settle(c);
    expect(c.spreaderLength).toBeCloseTo(SPREADER.maxLength, 6);
    expect(t).toBeGreaterThan(3);
  });

  it('locks onto a matching container, carries it, and sets it down on a truck', () => {
    const c = setup();
    const [x, y, z] = slotPosition(c.world.block, '20GP', { bay: 1, row: 1, tier: 2 });
    over(c, x, z);
    c.moveTo('hoist', 0);
    settle(c);
    expect(c.hoist.pos).toBeCloseTo(y + CONTAINER_SPECS['20GP'].height, 6);
    expect(c.lock()).toEqual({ ok: true });
    expect(c.world.block.containers.B).toBeUndefined();
    c.moveTo('hoist', c.spec.hoist.max);
    settle(c);
    // Truck T1 kingpin at x = 30; single 20ft goes in the centre slot.
    const truckX = 30 + (TRAILER.loadFrontX - 12.192 / 2);
    over(c, truckX, LANE_Z);
    c.moveTo('hoist', 0);
    settle(c);
    expect(c.hoist.pos).toBeCloseTo(TRAILER.deckY + CONTAINER_SPECS['20GP'].height, 6);
    expect(c.release()).toEqual({ ok: true });
    expect(c.world.trucks[0].load).toEqual({ centre20: '20GP' });
    expect(c.world.trucks[0].ids.centre20).toBe('B');
  });

  it('refuses to lock with the wrong length or when not on a container', () => {
    const c = setup();
    const [x, y, z] = slotPosition(c.world.block, '40HC', { bay: 6, row: 2, tier: 1 });
    over(c, x, z);
    c.moveTo('hoist', 0);
    settle(c);
    expect(c.hoist.pos).toBeCloseTo(y + CONTAINER_SPECS['40HC'].height, 6);
    const r = c.lock();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/set to 20ft/);

    c.moveTo('hoist', 6);
    settle(c);
    const r2 = c.lock();
    expect(r2.ok).toBe(false);
    if (!r2.ok) expect(r2.reason).toMatch(/not sitting squarely/);
  });

  it('refuses to release in mid-air and keeps holding the container', () => {
    const c = setup();
    const [x, , z] = slotPosition(c.world.block, '20GP', { bay: 1, row: 1, tier: 2 });
    over(c, x, z);
    c.moveTo('hoist', 0);
    settle(c);
    c.lock();
    c.moveTo('hoist', 9);
    settle(c);
    const r = c.release();
    expect(r.ok).toBe(false);
    expect(c.carried?.id).toBe('B');
  });

  it('a released container stays where it was put in the block', () => {
    const c = setup();
    const [x, , z] = slotPosition(c.world.block, '20GP', { bay: 1, row: 1, tier: 2 });
    over(c, x, z);
    c.moveTo('hoist', 0);
    settle(c);
    c.lock();
    const [x2, , z2] = slotPosition(c.world.block, '20GP', { bay: 3, row: 3, tier: 1 });
    over(c, x2, z2);
    c.moveTo('hoist', 0);
    settle(c);
    expect(c.release()).toEqual({ ok: true });
    expect(c.world.block.containers.B).toMatchObject({ bay: 3, row: 3, tier: 1 });
    c.moveTo('hoist', c.spec.hoist.max);
    settle(c);
    expect(c.world.block.containers.B).toMatchObject({ bay: 3, row: 3, tier: 1 });
  });

  it('cannot change length while holding a container', () => {
    const c = setup();
    const [x, , z] = slotPosition(c.world.block, '20GP', { bay: 1, row: 1, tier: 2 });
    over(c, x, z);
    c.moveTo('hoist', 0);
    settle(c);
    c.lock();
    expect(c.setSpreader(40).ok).toBe(false);
  });
});
