import { describe, expect, it } from 'vitest';
import { CONTAINER_SPECS } from '../models/container';
import { createBlock, place, type BlockState, type BlockContainer, blockLength } from '../models/yard';
import { CraneController, craneSpec } from '../models/crane';
import { placements } from '../models/truck/loads';
import { TRAILER } from '../models/truck/spec';
import { JobRunner, TRUCK_TOP, hangingClearance, type JobRequest } from './jobs';
import { solids } from './world';

const cfg = { bays: 8, rows: 4, tiers: 4 };

function build(): JobRunner {
  let b: BlockState = createBlock(cfg);
  const put = (c: Omit<BlockContainer, 'id'> & { id: string }) => {
    const r = place(b, c);
    if (!r.ok) throw new Error(r.reason);
    b = r.value;
  };
  put({ id: 'A1', type: '20GP', bay: 1, row: 1, tier: 1 });
  put({ id: 'A2', type: '20GP', bay: 1, row: 1, tier: 2 }); // on top of A1
  put({ id: 'B1', type: '20GP', bay: 3, row: 2, tier: 1 });
  put({ id: 'F1', type: '40HC', bay: 6, row: 3, tier: 1 });
  put({ id: 'F2', type: '40GP', bay: 6, row: 3, tier: 2 });
  const crane = new CraneController(craneSpec(cfg), { block: b, trucks: [] }, { gantry: 20 });
  return new JobRunner(crane, blockLength(cfg));
}

/** Runs the queue to the end, checking after every step that nothing passes through anything. */
function runAll(r: JobRunner, limitSeconds = 4000) {
  const problems: string[] = [];
  const dt = 1 / 20;
  for (let t = 0; t < limitSeconds && r.busy; t += dt) {
    r.step(dt);
    const c = r.crane;
    // What hangs from the crane never goes below whatever is under it.
    const { bottom, floor } = hangingClearance(c);
    if (bottom < floor - 1e-3) problems.push(`t=${t.toFixed(1)} hanging bottom ${bottom.toFixed(3)} below floor ${floor.toFixed(3)}`);
    // While a truck drives, nothing hanging may be low enough to touch it or its load.
    if (r.truck && r.truck.phase !== 'parked' && bottom < TRUCK_TOP(r.truck.load) + 0.3) {
      problems.push(`t=${t.toFixed(1)} spreader at ${bottom.toFixed(2)} while ${r.truck.id} drives under`);
    }
    // No two solids overlap in volume (stacked boxes only touch).
    const s = solids(c.world).filter((x) => x.kind === 'container');
    for (let i = 0; i < s.length; i++) for (let j = i + 1; j < s.length; j++) {
      const a = s[i], b = s[j];
      const overlapXZ = Math.abs(a.x - b.x) < a.hx + b.hx - 1e-3 && Math.abs(a.z - b.z) < a.hz + b.hz - 1e-3;
      if (overlapXZ && Math.abs(a.top - b.top) < 1e-3) problems.push(`t=${t.toFixed(1)} ${a.owner} and ${b.owner} occupy the same space`);
    }
    if (problems.length > 5) break;
  }
  return problems;
}

const reason = (x: { ok: boolean; reason?: string }) => (x.ok ? 'ok' : x.reason);

describe('job planning', () => {
  it('refuses a buried container, naming what is on top', () => {
    const r = build();
    expect(reason(r.add({ kind: 'delivery', from: [{ bay: 1, row: 1, tier: 1 }] }))).toMatch(/buried under A2/);
  });

  it('accepts a buried container when the job takes the one on top first', () => {
    const r = build();
    expect(reason(r.add({ kind: 'delivery', from: [{ bay: 1, row: 1, tier: 2 }, { bay: 1, row: 1, tier: 1 }] }))).toBe('ok');
  });

  it('refuses an empty address, an occupied target and a mid-air target', () => {
    const r = build();
    expect(reason(r.add({ kind: 'delivery', from: [{ bay: 5, row: 4, tier: 1 }] }))).toMatch(/no container/);
    expect(reason(r.add({ kind: 'receiving', types: ['20GP'], to: [{ bay: 3, row: 2, tier: 1 }] }))).toMatch(/already taken/);
    expect(reason(r.add({ kind: 'receiving', types: ['20GP'], to: [{ bay: 5, row: 1, tier: 3 }] }))).toMatch(/mid-air/);
  });

  it('refuses a load the trailer cannot carry', () => {
    const r = build();
    const req: JobRequest = { kind: 'delivery', from: [{ bay: 6, row: 3, tier: 2 }, { bay: 3, row: 2, tier: 1 }] };
    expect(reason(r.add(req))).toMatch(/40ft trailer carries/);
  });

  it('refuses a container that does not match the booked load', () => {
    const r = build();
    expect(reason(r.add({ kind: 'delivery', from: [{ bay: 6, row: 3, tier: 2 }], types: ['20GP'] }))).toMatch(/booked for a 20ft/);
    expect(reason(r.add({ kind: 'delivery', from: [{ bay: 6, row: 3, tier: 2 }], types: ['40HC'] }))).toMatch(/not a 40ft High Cube/);
    expect(reason(r.add({ kind: 'delivery', from: [{ bay: 6, row: 3, tier: 2 }], types: ['40GP'] }))).toBe('ok');
  });

  it('names an occupied target once', () => {
    const r = build();
    const msg = reason(r.add({ kind: 'receiving', types: ['20GP'], to: [{ bay: 3, row: 2, tier: 1 }] }));
    expect(msg).toBe('03-02-1 is already taken by B1.');
  });

  it('checks each new job against the block as queued jobs will leave it', () => {
    const r = build();
    expect(r.add({ kind: 'delivery', from: [{ bay: 3, row: 2, tier: 1 }] }).ok).toBe(true);
    // Same container again: it will be gone by then.
    expect(reason(r.add({ kind: 'delivery', from: [{ bay: 3, row: 2, tier: 1 }] }))).toMatch(/no container/);
    // Its slot will be free by then, so receiving into it is fine.
    expect(r.add({ kind: 'receiving', types: ['20GP'], to: [{ bay: 3, row: 2, tier: 1 }] }).ok).toBe(true);
  });
});

describe('running jobs', () => {
  it('delivery: the container leaves the block on a truck that drives away', () => {
    const r = build();
    r.add({ kind: 'delivery', from: [{ bay: 3, row: 2, tier: 1 }] });
    const problems = runAll(r);
    expect(problems).toEqual([]);
    expect(r.jobs[0].status).toBe('done');
    expect(r.crane.world.block.containers.B1).toBeUndefined();
    expect(r.crane.carried).toBeNull();
  });

  it('two-20ft delivery fills front and rear positions, one after the other', () => {
    const r = build();
    r.add({ kind: 'delivery', from: [{ bay: 1, row: 1, tier: 2 }, { bay: 1, row: 1, tier: 1 }] });
    const seen: string[] = [];
    for (let t = 0; t < 4000 && r.busy; t += 0.05) {
      r.step(0.05);
      const parked = r.crane.world.trucks[0];
      if (parked) {
        const key = JSON.stringify(parked.load);
        if (seen[seen.length - 1] !== key) seen.push(key);
      }
    }
    expect(r.jobs[0].status).toBe('done');
    expect(seen).toEqual(['{}', '{"front20":"20GP"}', '{"front20":"20GP","rear20":"20GP"}']);
    expect(r.jobs[0].moves.map((m) => [m.id, m.slot])).toEqual([['A2', 'front20'], ['A1', 'rear20']]);
  });

  it('receiving: containers come off an arriving truck into free block addresses', () => {
    const r = build();
    r.add({ kind: 'receiving', types: ['40HC'], to: [{ bay: 10, row: 4, tier: 1 }] });
    r.add({ kind: 'receiving', types: ['20GP', '20GP'], to: [{ bay: 5, row: 4, tier: 1 }, { bay: 5, row: 4, tier: 2 }] });
    const problems = runAll(r);
    expect(problems).toEqual([]);
    expect(r.jobs.map((j) => j.status)).toEqual(['done', 'done']);
    const at = (bay: number, row: number, tier: number) =>
      Object.values(r.crane.world.block.containers).find((c) => c.bay === bay && c.row === row && c.tier === tier);
    expect(at(10, 4, 1)?.type).toBe('40HC');
    expect(at(5, 4, 1)?.type).toBe('20GP');
    expect(at(5, 4, 2)?.type).toBe('20GP');
  });

  it('a mixed queue runs to the end on its own without anything passing through anything', () => {
    const r = build();
    const reqs: JobRequest[] = [
      { kind: 'delivery', from: [{ bay: 6, row: 3, tier: 2 }] },
      { kind: 'receiving', types: ['20GP', '20GP'], to: [{ bay: 13, row: 1, tier: 1 }, { bay: 15, row: 1, tier: 1 }] },
      { kind: 'delivery', from: [{ bay: 6, row: 3, tier: 1 }] },
      { kind: 'delivery', from: [{ bay: 1, row: 1, tier: 2 }] },
    ];
    for (const q of reqs) expect(reason(r.add(q))).toBe('ok');
    const problems = runAll(r, 8000);
    expect(problems).toEqual([]);
    expect(r.jobs.map((j) => j.status)).toEqual(['done', 'done', 'done', 'done']);
    expect(Object.keys(r.crane.world.block.containers).sort()).toEqual(
      ['A1', 'B1', ...r.jobs[1].moves.map((m) => m.id)].sort(),
    );
  });

  it('trucks leave carrying exactly what was loaded, at deck height', () => {
    const r = build();
    r.add({ kind: 'delivery', from: [{ bay: 6, row: 3, tier: 2 }] });
    let leaving: string | null = null;
    for (let t = 0; t < 4000 && r.busy; t += 0.05) {
      r.step(0.05);
      if (r.truck?.phase === 'leaving') leaving = JSON.stringify(placements(r.truck.load).map((p) => p.type));
    }
    expect(leaving).toBe('["40GP"]');
    expect(TRUCK_TOP({ full40: '40GP' })).toBeCloseTo(TRAILER.deckY + CONTAINER_SPECS['40GP'].height, 6);
  });
});

import { suggestDelivery, suggestReceiving } from './jobs';

describe('job form suggestions', () => {
  it('suggested deliveries and receivings are always accepted', () => {
    for (let seed = 1; seed < 30; seed++) {
      let s = seed;
      const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
      const r = build();
      for (const types of [['20GP'], ['20GP', '20GP'], ['40HC'], ['40GP']] as const) {
        const from = suggestDelivery(r.planned, [...types], rand);
        if (from) expect(reason(r.add({ kind: 'delivery', from }))).toBe('ok');
        const to = suggestReceiving(r.planned, [...types], rand);
        expect(to).not.toBeNull();
        expect(reason(r.add({ kind: 'receiving', types: [...types], to: to! }))).toBe('ok');
      }
    }
  });
});

import { blockWidth, type BlockConfig } from '../models/yard';
import { LANE_WIDTH, LANE_Z } from '../models/crane';
import { yardQuay, yardCraneFarZ, yardCraneXRange } from '../models/quay';
import { MAX_ARTICULATION, TruckMotion, peakArticulation } from '../motion/truckMotion';
import { GATE_X, ENTRY_Z, TURN_RADIUS, quayTourRoute } from './jobs';

describe('demo drive from the gate along the apron to the yard and out', () => {
  const CONFIGS: BlockConfig[] = [cfg, { bays: 10, rows: 6, tiers: 5 }, { bays: 2, rows: 1, tiers: 1 }, { bays: 24, rows: 10, tiers: 7 }];
  const SHIPS = [80, 150, 400];
  const cases = CONFIGS.flatMap((block) => SHIPS.map((ship) => ({ block, ship, what: `block ${block.bays}x${block.rows}x${block.tiers}, ship ${ship} m` })));

  it('passes the gate, the whole berth along apron lane 1, the block lane past the whole block, then the exit, in that order', () => {
    for (const { block, ship, what } of cases) {
      const quay = yardQuay(block, ship);
      const L = blockLength(block);
      const route = quayTourRoute(L, quay);
      const lane1 = quay.lanes[0].z;
      const start = route.at(0);
      expect([start.x, start.z], what).toEqual([GATE_X, ENTRY_Z]);
      let apronFrom = Infinity, apronTo = -Infinity, apronFirst = -1, laneFrom = Infinity, laneTo = -Infinity, laneFirst = -1;
      for (let s = 0; s <= route.length; s += 0.5) {
        const p = route.at(s);
        if (Math.abs(p.z - lane1) < 1e-6) {
          if (apronFirst < 0) apronFirst = s;
          apronFrom = Math.min(apronFrom, p.x);
          apronTo = Math.max(apronTo, p.x);
        }
        if (Math.abs(p.z - LANE_Z) < 1e-6 && s > apronFirst && apronFirst >= 0) {
          if (laneFirst < 0) laneFirst = s;
          laneFrom = Math.min(laneFrom, p.x);
          laneTo = Math.max(laneTo, p.x);
        }
      }
      expect(apronFirst, `${what}: never on the apron`).toBeGreaterThan(0);
      expect(laneFirst, `${what}: never in the block lane after the apron`).toBeGreaterThan(apronFirst);
      expect(apronFrom, `${what}: apron stretch`).toBeLessThan(quay.ship.x0);
      expect(apronTo, `${what}: apron stretch`).toBeGreaterThan(quay.ship.x1);
      expect(laneFrom, `${what}: block lane stretch`).toBeLessThan(0);
      expect(laneTo, `${what}: block lane stretch`).toBeGreaterThan(L);
      const end = route.at(route.length);
      expect(route.stops.Exit, what).toBeCloseTo(route.length, 6);
      expect(end.z, what).toBeCloseTo(LANE_Z, 6);
      expect(end.x, what).toBeGreaterThan(L);
      expect(peakArticulation(route), `${what}: a corner too tight for the trailer`).toBeLessThanOrEqual(MAX_ARTICULATION);
      expect(new TruckMotion(route).routeProblem, what).toBeNull();
    }
  });

  it('stays on roads: off the block and away from the crane except in the block lane, and on the quay only on lane 1 and the connectors', () => {
    for (const { block, ship, what } of cases) {
      const quay = yardQuay(block, ship);
      const route = quayTourRoute(blockLength(block), quay);
      const spec = craneSpec(block);
      const [cx0, cx1] = yardCraneXRange(block);
      const craneZ0 = spec.legZ[0] - 1;
      const craneZ1 = yardCraneFarZ(block);
      const half = LANE_WIDTH / 2;
      const { westX, eastX } = quay.connectors;
      const lane1 = quay.lanes[0].z;
      for (let s = 0; s <= route.length; s += 0.25) {
        const { x, z } = route.at(s);
        const at = `${what}: at ${x.toFixed(1)}, ${z.toFixed(1)}`;
        // Near the block or its crane only in the block lane.
        const nearYard = x + half > cx0 && x - half < cx1 && z + half > craneZ0 && z - half < craneZ1;
        if (nearYard) expect(Math.abs(z - LANE_Z), at).toBeLessThan(1e-6);
        expect(x + half > 0 && x - half < blockLength(block) && z + half > 0 && z - half < blockWidth(block), `${at}: on the block`).toBe(false);
        // Never past lane 1 toward the water; on the quay beside the ship only in lane 1.
        expect(z, at).toBeLessThanOrEqual(lane1 + 1e-6);
        if (z + half > quay.landZ && Math.abs(z - lane1) > 1e-6) {
          const nearConnector = Math.min(Math.abs(x - westX), Math.abs(x - eastX)) <= TURN_RADIUS + 1e-6;
          expect(nearConnector, `${at}: crossing the quay away from the connectors`).toBe(true);
          expect(x < quay.ship.x0 || x > quay.ship.x1, `${at}: across the backreach beside the ship`).toBe(true);
        }
      }
    }
  });

  const tourRunner = () => {
    const r = build();
    return { r, route: quayTourRoute(blockLength(cfg), yardQuay(cfg)) };
  };

  it('an empty truck drives it to the end and leaves; the crane stays raised clear of it the whole way', () => {
    const { r, route } = tourRunner();
    // The crane left low, as a person might leave it.
    r.crane.hoist.pos = r.crane.hoist.target = 1;
    const [cx0, cx1] = yardCraneXRange(cfg);
    let underCrane = 0;
    const res = r.tour(route);
    expect(res.ok).toBe(true);
    expect(r.truck?.phase).toBe('touring');
    let lastS = 0;
    for (let t = 0; t < 600 && r.truck; t += 0.05) {
      r.step(0.05);
      if (!r.truck) break;
      expect(r.truck.motion.s).toBeGreaterThanOrEqual(lastS);
      lastS = r.truck.motion.s;
      const p = r.truck.motion.pose();
      if (Math.abs(p.z - LANE_Z) < 1e-6 && p.x > cx0 - 20 && p.x < cx1 + 20) {
        underCrane++;
        const { bottom } = hangingClearance(r.crane);
        expect(bottom, `spreader low over the truck at x=${p.x.toFixed(1)}`).toBeGreaterThan(TRUCK_TOP({}) + 0.3);
      }
    }
    expect(underCrane, 'the truck never drove under the crane').toBeGreaterThan(0);
    expect(r.truck, 'the truck never left').toBeNull();
    expect(lastS).toBeCloseTo(route.length, 1);
    expect(r.crane.world.trucks).toEqual([]);
  });

  it('is refused while a truck is on site, jobs are waiting or the queue is paused; jobs wait until it has left', () => {
    const { r, route } = tourRunner();
    // Jobs waiting.
    r.add({ kind: 'delivery', from: [{ bay: 3, row: 2, tier: 1 }] });
    const queued = r.tour(route);
    expect(queued.ok).toBe(false);
    expect(reason(queued)).toMatch(/waiting in the queue/);
    runAll(r);
    expect(r.jobs[0].status).toBe('done');
    // Paused.
    r.paused = { jobId: 'JOB-X', reason: 'test', recovering: false, refused: [] };
    expect(reason(r.tour(route))).toMatch(/paused/);
    r.paused = null;
    // A truck on site, and a job queued during the drive waits for it.
    expect(r.tour(route).ok).toBe(true);
    expect(reason(r.tour(route))).toMatch(/still on site/);
    r.add({ kind: 'delivery', from: [{ bay: 1, row: 1, tier: 2 }] });
    for (let t = 0; t < 600 && r.truck?.phase === 'touring'; t += 0.05) {
      r.step(0.05);
      expect(r.jobs[1].status, 'the job started while the demo truck was on site').toBe('queued');
    }
    expect(r.truck).toBeNull();
    expect(runAll(r)).toEqual([]);
    expect(r.jobs[1].status).toBe('done');
  });
});
