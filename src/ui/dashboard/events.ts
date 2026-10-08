import { createStore } from '../../lib/store';
import type { Job, JobStatus } from '../../sim/jobs';

/** Something worth telling the operator about: a job finishing, stopping or being dropped. */
export interface YardEvent {
  key: string;
  jobId: string;
  status: 'done' | 'failed' | 'refused';
  time: number;
  text: string;
}

const WORTH_TELLING: Partial<Record<JobStatus, YardEvent['status']>> = { done: 'done', failed: 'failed', refused: 'refused' };

/** Returns the events for jobs that reached a reportable status since they were last seen. */
export function newEvents(jobs: Job[], seen: Map<string, JobStatus>, now: number): YardEvent[] {
  const out: YardEvent[] = [];
  for (const j of jobs) {
    const before = seen.get(j.id);
    seen.set(j.id, j.status);
    const status = WORTH_TELLING[j.status];
    if (!status || before === j.status) continue;
    const what = `${j.kind === 'delivery' ? 'Delivery' : 'Receiving'} ${j.id} (${j.truckId})`;
    const text =
      status === 'done' ? `${what} finished` : status === 'failed' ? `${what} stopped: ${j.error ?? ''}` : `${what} refused: ${j.error ?? ''}`;
    out.push({ key: `${j.id}:${status}`, jobId: j.id, status, time: j.finishedAt ?? now, text: text.trim() });
  }
  return out;
}

export const eventStore = createStore({ events: [] as YardEvent[], unread: 0 });
const seen = new Map<string, JobStatus>();

/** Feed every jobs snapshot through this; new events are added newest first. */
export function recordEvents(jobs: Job[], now: number) {
  const fresh = newEvents(jobs, seen, now);
  if (!fresh.length) return;
  fresh.sort((a, b) => b.time - a.time);
  eventStore.set((s) => ({ events: [...fresh, ...s.events].slice(0, 50), unread: s.unread + fresh.length }));
}
export const markEventsRead = () => eventStore.set({ unread: 0 });
export function clearEvents() {
  seen.clear();
  eventStore.set({ events: [], unread: 0 });
}
