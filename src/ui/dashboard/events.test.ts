import { describe, expect, it } from 'vitest';
import type { Job } from '../../sim/jobs';
import { newEvents } from './events';

const job = (id: string, status: Job['status'], extra: Partial<Job> = {}): Job => ({
  id, kind: 'delivery', truckId: 'TRK-01', moves: [], status, step: '', stage: 0, ...extra,
});

describe('yard events', () => {
  it('reports each job once when it finishes, stops or is refused', () => {
    const seen = new Map();
    expect(newEvents([job('J1', 'queued')], seen, 0)).toEqual([]);
    expect(newEvents([job('J1', 'running')], seen, 5)).toEqual([]);
    const done = newEvents([job('J1', 'done', { finishedAt: 120 })], seen, 130);
    expect(done).toMatchObject([{ jobId: 'J1', status: 'done', time: 120, text: 'Delivery J1 (TRK-01) finished' }]);
    expect(newEvents([job('J1', 'done', { finishedAt: 120 })], seen, 140)).toEqual([]);
  });

  it('includes the reason for stopped and refused jobs', () => {
    const seen = new Map();
    const ev = newEvents(
      [job('J2', 'failed', { error: 'Slot taken.' }), job('J3', 'refused', { kind: 'receiving', error: 'No longer free.' })],
      seen,
      10,
    );
    expect(ev.map((e) => e.text)).toEqual(['Delivery J2 (TRK-01) stopped: Slot taken.', 'Receiving J3 (TRK-01) refused: No longer free.']);
  });
});
