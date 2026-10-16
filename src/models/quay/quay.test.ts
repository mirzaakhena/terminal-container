import { describe, expect, it } from 'vitest';
import { blockLength, blockWidth, type BlockConfig } from '../yard';
import { LANE_WIDTH, LANE_Z, craneSpec } from '../crane';
import { frameParts } from '../crane/frame';
import { CORNER_X, ENTRY_Z, TURN_RADIUS } from '../../sim/jobs';
import {
  APRON_LANE_COUNT, BERTH_END_CLEARANCE, LEG_CLEARANCE, RAIL_GAUGE, berthLabel, quayLayout, type QuayLayout,
} from './layout';
import { YARD_TO_QUAY_GAP, yardCraneFarZ, yardQuay } from './terminal';

const SHIPS = [80, 150, 220, 300, 400];
const BLOCKS: BlockConfig[] = [
  { bays: 10, rows: 6, tiers: 5 },
  { bays: 2, rows: 1, tiers: 1 },
  { bays: 24, rows: 10, tiers: 7 },
  { bays: 8, rows: 4, tiers: 4 },
];

const layouts = (): { what: string; q: QuayLayout; block: BlockConfig }[] =>
  BLOCKS.flatMap((block) => SHIPS.map((ship) => ({ what: `block ${block.bays}x${block.rows}x${block.tiers}, ship ${ship} m`, q: yardQuay(block, ship), block })));

/** x range the yard crane can ever cover, worked out here independently of the layout code. */
function craneXRange(block: BlockConfig): [number, number] {
  const spec = craneSpec(block);
  const parts = frameParts(spec);
  const lo = Math.min(...parts.map((b) => Math.min(b.from[0], b.to[0])));
  const hi = Math.max(...parts.map((b) => Math.max(b.from[0], b.to[0])));
  return [spec.gantry.min + lo, spec.gantry.max + hi];
}

describe('berth', () => {
  it('is the ship length plus 25 m at each end, for every ship size, with the ship centred on it', () => {
    for (const ship of SHIPS) {
      const q = quayLayout({ shipLength: ship, centreX: 10, landZ: 30 });
      expect(q.berth.length, `${ship} m ship`).toBeCloseTo(ship + 2 * BERTH_END_CLEARANCE, 9);
      expect(q.length).toBeCloseTo(q.berth.length, 9);
      expect(q.ship.x0 - q.x0, `${ship} m ship: free quay at the west end`).toBeCloseTo(BERTH_END_CLEARANCE, 9);
      expect(q.x1 - q.ship.x1, `${ship} m ship: free quay at the east end`).toBeCloseTo(BERTH_END_CLEARANCE, 9);
      expect((q.x0 + q.x1) / 2).toBeCloseTo(10, 9);
    }
  });

  it('has bollards along the edge from one end of the berth to the other, about 20 m apart', () => {
    for (const ship of SHIPS) {
      const q = quayLayout({ shipLength: ship, centreX: 0, landZ: 0 });
      const xs = q.bollards.map((b) => b.x);
      expect(xs[0]).toBeCloseTo(q.x0, 9);
      expect(xs[xs.length - 1]).toBeCloseTo(q.x1, 9);
      for (let i = 1; i < xs.length; i++) {
        const gap = xs[i] - xs[i - 1];
        expect(gap, `${ship} m ship, bollards ${i - 1}–${i}`).toBeGreaterThan(15);
        expect(gap, `${ship} m ship, bollards ${i - 1}–${i}`).toBeLessThan(25);
      }
      for (const b of q.bollards) {
        expect(b.z).toBeLessThan(q.edgeZ);
        expect(b.z).toBeGreaterThan(q.rails.waterZ);
      }
    }
  });

  it('is labelled with its name and length', () => {
    expect(berthLabel(quayLayout({ shipLength: 150, centreX: 0, landZ: 0 }))).toBe('Berth 1 · 200 m');
    expect(berthLabel(quayLayout({ shipLength: 400, centreX: 0, landZ: 0, berthName: 'Berth 2' }))).toBe('Berth 2 · 450 m');
  });

  it('refuses a ship of no length', () => {
    expect(() => quayLayout({ shipLength: 0, centreX: 0, landZ: 0 })).toThrow(/longer than 0/);
  });
});

describe('across the quay', () => {
  it('runs land to water: backreach, landside rail, apron lanes, waterside rail, edge', () => {
    for (const { what, q } of layouts()) {
      expect(q.backreach.z0, what).toBeGreaterThanOrEqual(q.landZ);
      expect(q.backreach.z1, what).toBeLessThan(q.rails.landZ);
      expect(q.rails.waterZ - q.rails.landZ, what).toBeCloseTo(RAIL_GAUGE, 9);
      expect(q.edgeZ, what).toBeGreaterThan(q.rails.waterZ);
    }
  });

  it('puts every apron lane between the crane legs, clear of both rails, without touching its neighbours', () => {
    for (const { what, q } of layouts()) {
      expect(q.lanes.length).toBe(APRON_LANE_COUNT);
      q.lanes.forEach((lane, i) => {
        const near = lane.z - lane.width / 2;
        const far = lane.z + lane.width / 2;
        expect(near - q.rails.landZ, `${what}: lane ${lane.number} to the landside rail`).toBeGreaterThanOrEqual(LEG_CLEARANCE);
        expect(q.rails.waterZ - far, `${what}: lane ${lane.number} to the waterside rail`).toBeGreaterThanOrEqual(LEG_CLEARANCE);
        expect(lane.number).toBe(i + 1);
        if (i > 0) {
          const prev = q.lanes[i - 1];
          expect(near, `${what}: lane ${lane.number} overlaps lane ${prev.number}`).toBeGreaterThan(prev.z + prev.width / 2);
        }
      });
      // Lane 1 is the one nearest the land.
      expect(q.lanes[0].z).toBe(Math.min(...q.lanes.map((l) => l.z)));
    }
  });

  it('keeps the backreach free of apron lanes', () => {
    for (const { what, q } of layouts()) {
      for (const lane of q.lanes) expect(lane.z - lane.width / 2, `${what}: lane ${lane.number}`).toBeGreaterThan(q.backreach.z1);
    }
  });
});

describe('beside the yard', () => {
  it('for the default block and feeder, the roads join the apron inside the quay\'s free ends', () => {
    const q = yardQuay({ bays: 10, rows: 6, tiers: 5 });
    expect(q.berth.length).toBeCloseTo(200, 9);
    expect(q.connectors.westX).toBeGreaterThan(q.x0);
    expect(q.connectors.eastX).toBeLessThan(q.x1);
    expect(q.apron).toEqual({ x0: q.x0, x1: q.x1 });
  });

  it('lies along the block\'s long side, on the side away from the lane and the gate road', () => {
    for (const { what, q, block } of layouts()) {
      const W = blockWidth(block);
      // Gate road, then truck lane, then the block, then the quay.
      expect(ENTRY_Z).toBeLessThan(LANE_Z);
      expect(LANE_Z + LANE_WIDTH / 2, what).toBeLessThan(0);
      expect(q.landZ, what).toBeGreaterThan(W);
      // Running along the block: centred on it, and the apron reaches past both its ends.
      expect((q.x0 + q.x1) / 2, what).toBeCloseTo(blockLength(block) / 2, 9);
      expect(q.apron.x0, what).toBeLessThan(0);
      expect(q.apron.x1, what).toBeGreaterThan(blockLength(block));
    }
  });

  it('does not overlap the block, its crane at any gantry position, or its lane', () => {
    for (const { what, q, block } of layouts()) {
      const spec = craneSpec(block);
      const far = yardCraneFarZ(block);
      expect(far, what).toBeGreaterThanOrEqual(spec.legZ[1]);
      expect(far, what).toBeGreaterThan(blockWidth(block));
      expect(q.landZ - far, `${what}: gap between the yard crane and the quay`).toBeCloseTo(YARD_TO_QUAY_GAP, 9);
      expect(q.landZ, what).toBeGreaterThan(LANE_Z + LANE_WIDTH / 2);
    }
  });

  it('joins the roads to the apron inside the berth\'s free ends, never across the backreach beside the ship', () => {
    for (const { what, q, block } of layouts()) {
      const { westX, eastX } = q.connectors;
      // The road and its corner onto the apron both lie beyond the ship's ends, and the apron lanes reach them.
      expect(westX + TURN_RADIUS, what).toBeLessThan(q.ship.x0);
      expect(eastX - TURN_RADIUS, what).toBeGreaterThan(q.ship.x1);
      expect(q.apron.x0, what).toBeLessThanOrEqual(westX);
      expect(q.apron.x1, what).toBeGreaterThanOrEqual(eastX);
      // And clear of the block and the yard crane at either end of its travel.
      const [cx0, cx1] = craneXRange(block);
      expect(westX + LANE_WIDTH / 2, what).toBeLessThan(Math.min(0, cx0));
      expect(eastX - LANE_WIDTH / 2, what).toBeGreaterThan(Math.max(blockLength(block), cx1));
      // The west connector's corner into the block lane stays west of the corner where the gate road turns in.
      expect(westX + TURN_RADIUS + LANE_WIDTH / 2, what).toBeLessThan(CORNER_X);
    }
  });
});
