import { describe, expect, it } from 'vitest';
import { createBlock, place, type BlockState } from '../../models/yard';
import type { Job } from '../../sim/jobs';
import { blockStats, movesDone, yardClock } from './yardStats';

const cfg = { bays: 4, rows: 2, tiers: 2 };
function block(): BlockState {
  let b = createBlock(cfg);
  for (const c of [
    { id: 'A', type: '20GP', bay: 1, row: 1, tier: 1 },
    { id: 'B', type: '20GP', bay: 1, row: 1, tier: 2 },
    { id: 'F', type: '40HC', bay: 2, row: 2, tier: 1 },
  ] as const) {
    const r = place(b, { ...c });
    if (!r.ok) throw new Error(r.reason);
    b = r.value;
  }
  return b;
}

describe('dashboard figures', () => {
  it('counts boxes, TEU, capacity and reachable containers', () => {
    const s = blockStats(block());
    expect(s.count).toBe(3);
    expect(s.teu).toBe(4);
    expect(s.capacityTeu).toBe(16);
    expect(s.fill).toBeCloseTo(0.25, 6);
    expect(s.byType).toEqual({ '20GP': 2, '40GP': 0, '40HC': 1 });
    expect(s.reachable).toBe(2); // A is under B
  });

  it('counts moves done for running deliveries and receivings', () => {
    const b = block();
    const job = (kind: Job['kind'], status: Job['status'], ids: string[]): Job => ({
      id: 'J', kind, truckId: 'T', status, step: '', stage: 2,
      moves: ids.map((id) => ({ id, type: '20GP', color: 0, slot: 'centre20', address: { bay: 1, row: 1, tier: 1 } })),
    });
    expect(movesDone(job('delivery', 'running', ['B', 'GONE']), b)).toBe(1);
    expect(movesDone(job('receiving', 'running', ['A', 'NEW']), b)).toBe(1);
    expect(movesDone(job('delivery', 'queued', ['B']), b)).toBe(0);
    expect(movesDone(job('delivery', 'done', ['B', 'A']), b)).toBe(2);
  });

  it('shows yard time as a clock from 08:00', () => {
    expect(yardClock(0)).toBe('08:00');
    expect(yardClock(3600 + 30 * 60 + 59)).toBe('09:30');
  });
});
