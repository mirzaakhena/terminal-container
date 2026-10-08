import { describe, expect, it } from 'vitest';
import { createBlock, place, blockLength, remove, type BlockState, type BlockContainer } from '../models/yard';
import { CraneController, craneSpec } from '../models/crane';
import { JobRunner } from './jobs';

const cfg = { bays: 8, rows: 4, tiers: 4 };

function build(): JobRunner {
  let b: BlockState = createBlock(cfg);
  const put = (c: Omit<BlockContainer, 'id'> & { id: string }) => {
    const r = place(b, c);
    if (!r.ok) throw new Error(r.reason);
    b = r.value;
  };
  put({ id: 'B1', type: '20GP', bay: 3, row: 2, tier: 1 });
  put({ id: 'C1', type: '20GP', bay: 7, row: 3, tier: 1 });
  const crane = new CraneController(craneSpec(cfg), { block: b, trucks: [] }, { gantry: 20 });
  return new JobRunner(crane, blockLength(cfg));
}

/** Changes the real block behind the queue's back, as a person might by hand. */
function meddle(r: JobRunner, f: (b: BlockState) => BlockState) {
  r.crane.world = { ...r.crane.world, block: f(r.crane.world.block) };
}
const must = <T,>(x: { ok: true; value: T } | { ok: false; reason: string }) => {
  if (!x.ok) throw new Error(x.reason);
  return x.value;
};

function runUntil(r: JobRunner, cond: () => boolean, limit = 4000) {
  for (let t = 0; t < limit && !cond(); t += 0.05) r.step(0.05);
  expect(cond(), 'condition never reached').toBe(true);
}

describe('a job that stops partway', () => {
  it('receiving into a slot that was filled meanwhile: pauses, returns the box to the truck, sends the truck off', () => {
    const r = build();
    r.add({ kind: 'receiving', types: ['20GP'], to: [{ bay: 5, row: 1, tier: 1 }] });
    const recvId = r.jobs[0].moves[0].id;
    // A later job that depends on the first having worked, and one that does not.
    r.add({ kind: 'delivery', from: [{ bay: 5, row: 1, tier: 1 }] });
    r.add({ kind: 'delivery', from: [{ bay: 7, row: 3, tier: 1 }] });
    runUntil(r, () => r.truck?.phase === 'arriving');
    meddle(r, (b) => must(place(b, { id: 'INTRUDER', type: '20GP', bay: 5, row: 1, tier: 1 })));

    runUntil(r, () => !!r.paused && !r.paused.recovering);
    expect(r.jobs[0].status).toBe('failed');
    expect(r.paused!.jobId).toBe('JOB-001');
    expect(r.paused!.reason).toMatch(/05-01-1/);
    expect(r.crane.carried, 'the box should not be left hanging').toBeNull();
    expect(r.truck, 'the truck should have left').toBeNull();
    expect(r.crane.world.trucks).toEqual([]);
    expect(r.crane.world.block.containers[recvId], 'the box went back on the truck, not into the block').toBeUndefined();

    // Re-checked against the real block: the second job now targets the intruder, not its container.
    expect(r.jobs[1].status).toBe('refused');
    expect(r.jobs[1].error).toMatch(/no longer at 05-01-1/);
    expect(r.jobs[2].status).toBe('queued');
    expect(r.paused!.refused).toEqual(['JOB-002']);

    // Paused: nothing more happens until resumed.
    for (let i = 0; i < 200; i++) r.step(0.05);
    expect(r.jobs[2].status).toBe('queued');
    expect(r.resume()).toEqual({ ok: true });
    runUntil(r, () => r.jobs[2].status === 'done');
    expect(r.crane.world.block.containers.C1).toBeUndefined();
    expect(r.crane.world.block.containers.INTRUDER).toBeDefined();
  });

  it('delivery whose container disappeared: stops before lifting anything', () => {
    const r = build();
    r.add({ kind: 'delivery', from: [{ bay: 3, row: 2, tier: 1 }] });
    runUntil(r, () => r.truck?.phase === 'arriving');
    meddle(r, (b) => must(remove(b, 'B1')));
    runUntil(r, () => !!r.paused && !r.paused.recovering);
    expect(r.jobs[0].status).toBe('failed');
    expect(r.jobs[0].error).toMatch(/B1 is no longer at 03-02-1/);
    expect(r.crane.carried).toBeNull();
    expect(r.truck).toBeNull();
  });

  it('a delivery interrupted while carrying puts the container back where it came from', () => {
    const r = build();
    r.add({ kind: 'delivery', from: [{ bay: 3, row: 2, tier: 1 }] });
    runUntil(r, () => r.crane.carried?.id === 'B1');
    // The truck vanishes from under the crane (e.g. it was moved by hand): setting down will fail.
    r.crane.world = { ...r.crane.world, trucks: [] };
    runUntil(r, () => !!r.paused && !r.paused.recovering);
    expect(r.jobs[0].status).toBe('failed');
    expect(r.crane.carried).toBeNull();
    expect(r.crane.world.block.containers.B1).toMatchObject({ bay: 3, row: 2, tier: 1 });
  });

  it('cannot resume while still recovering, and says why', () => {
    const r = build();
    r.add({ kind: 'delivery', from: [{ bay: 3, row: 2, tier: 1 }] });
    runUntil(r, () => r.crane.carried?.id === 'B1');
    r.crane.world = { ...r.crane.world, trucks: [] };
    runUntil(r, () => !!r.paused);
    const early = r.resume();
    expect(early.ok).toBe(false);
  });
});
