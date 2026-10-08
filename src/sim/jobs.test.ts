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
