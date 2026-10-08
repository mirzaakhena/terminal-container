import { describe, expect, it } from 'vitest';
import { CONTAINER_SPECS } from '../container';
import { BAY_PITCH, BLOCK_MARGIN, ROW_PITCH, createBlock, place, type BlockState } from '../yard';
import { SLOTS } from '../truck/loads';
import type { World } from '../../sim/world';
import { CraneController, type AxisName } from './controller';
import { LANE_Z, craneSpec } from './spec';

const cfg = { bays: 6, rows: 4, tiers: 3 };
const TRUCK_X = 30;

const ROW1 = BLOCK_MARGIN + 0.5 * ROW_PITCH;

function setup(trolley = ROW1) {
  let block: BlockState = createBlock(cfg);
  const r = place(block, { id: 'A', type: '20GP', bay: 3, row: 1, tier: 1, color: 2 });
  if (!r.ok) throw new Error(r.reason);
  block = r.value;
  const world: World = { block, trucks: [{ id: 'T1', x: TRUCK_X, z: LANE_Z, load: {}, ids: {}, colors: {} }] };
  return new CraneController(craneSpec(cfg), world, { gantry: 2, trolley });
}

const settle = (c: CraneController) => {
  for (let t = 0; t < 300 && c.moving; t += 1 / 30) c.step(1 / 30);
};
/** Hold a direction button until `until` says stop (like a person watching the screen), then let go. */
function hold(c: CraneController, name: AxisName, dir: -1 | 1, until: () => boolean) {
  c.jog(name, dir);
  for (let t = 0; t < 120 && !until(); t += 1 / 30) c.step(1 / 30);
  c.stopAndAlign(name);
  settle(c);
}

describe('hold-to-move controls', () => {
  it('a rough stop near a bay finishes exactly on the bay centre', () => {
    const c = setup();
    const bay3 = BLOCK_MARGIN + 1.5 * BAY_PITCH;
    // Let go when the crane would coast to within a metre or so of the bay, as an operator learns to.
    hold(c, 'gantry', 1, () => c.stoppingPoint('gantry') > bay3 - 1.2);
    expect(c.gantry.pos).toBeCloseTo(bay3, 6);
  });

  it('inside the block every stop lands on a bay; beyond the block it stays where it stopped', () => {
    const c = setup();
    hold(c, 'gantry', 1, () => c.stoppingPoint('gantry') > BLOCK_MARGIN + 2 * BAY_PITCH + 0.2); // just past a boundary
    expect(c.gantry.pos).toBeCloseTo(BLOCK_MARGIN + 2.5 * BAY_PITCH, 6);
    hold(c, 'gantry', 1, () => false); // all the way to the end stop
    expect(c.gantry.pos).toBeCloseTo(c.spec.gantry.max, 6);
  });

  it('a person can pick a container from the block and put it on the parked truck with hold-to-move only', () => {
    const c = setup(LANE_Z);
    const bay3 = BLOCK_MARGIN + 1.5 * BAY_PITCH;
    hold(c, 'trolley', 1, () => c.stoppingPoint('trolley') > ROW1 - 0.6);
    hold(c, 'gantry', 1, () => c.stoppingPoint('gantry') > bay3 - 0.5);
    expect(c.canLock().ok).toBe(false); // still up high
    hold(c, 'hoist', -1, () => false); // lower until it lands
    expect(c.hoist.pos).toBeCloseTo(CONTAINER_SPECS['20GP'].height, 6);
    expect(c.canLock()).toEqual({ ok: true });
    expect(c.lock()).toEqual({ ok: true });
    hold(c, 'hoist', 1, () => c.hoist.pos > 8);
    hold(c, 'trolley', -1, () => c.stoppingPoint('trolley') < LANE_Z + 0.7);
    const truckCentre = TRUCK_X + SLOTS.centre20.centreX;
    hold(c, 'gantry', 1, () => c.stoppingPoint('gantry') > truckCentre - 0.8);
    hold(c, 'hoist', -1, () => false);
    expect(c.canRelease()).toEqual({ ok: true });
    expect(c.release()).toEqual({ ok: true });
    expect(c.world.trucks[0].load).toEqual({ centre20: '20GP' });
  });

  it('lock and release report why they are unavailable', () => {
    const c = setup();
    expect(c.canRelease()).toMatchObject({ ok: false, reason: expect.stringMatching(/not holding/) });
    expect(c.canLock()).toMatchObject({ ok: false, reason: expect.stringMatching(/Lower the spreader/) });
  });

  it('over the lane the gantry lines up with trailer positions, over the block with bays', () => {
    const c = setup(LANE_Z);
    const truckSlots = Object.values(SLOTS).filter((sl) => sl.feet === 20).map((sl) => TRUCK_X + sl.centreX);
    expect([...c.snapPositions('gantry')].sort()).toEqual([...truckSlots].sort());
    c.moveTo('trolley', ROW1);
    settle(c);
    expect(c.snapPositions('gantry')).toContain(BLOCK_MARGIN + 0.5 * BAY_PITCH);
  });

  it('gantry snap positions follow the spreader length', () => {
    const c = setup();
    const twenty = c.snapPositions('gantry');
    c.setSpreader(40);
    const forty = c.snapPositions('gantry');
    expect(twenty).toContain(BLOCK_MARGIN + 0.5 * BAY_PITCH);
    expect(forty).toContain(BLOCK_MARGIN + BAY_PITCH);
    expect(forty).not.toContain(BLOCK_MARGIN + 0.5 * BAY_PITCH);
  });
});
