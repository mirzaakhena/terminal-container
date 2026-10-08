import { CONTAINER_SPECS } from '../../models/container';
import { containersOnTop, type BlockState } from '../../models/yard';
import type { Job, JobRunner } from '../../sim/jobs';

/** Figures the dashboard shows, worked out from the live yard. */
export function blockStats(block: BlockState) {
  const all = Object.values(block.containers);
  const { bays, rows, tiers } = block.config;
  const teu = all.reduce((n, c) => n + (CONTAINER_SPECS[c.type].nominalFeet === 40 ? 2 : 1), 0);
  const capacityTeu = bays * rows * tiers;
  const byType = { '20GP': 0, '40GP': 0, '40HC': 0 } as Record<keyof typeof CONTAINER_SPECS, number>;
  for (const c of all) byType[c.type]++;
  const reachable = all.filter((c) => containersOnTop(block, c.id).length === 0).length;
  return { count: all.length, teu, capacityTeu, byType, reachable, fill: capacityTeu ? teu / capacityTeu : 0 };
}

/** How many of a job's containers have already been moved. */
export function movesDone(job: Job, block: BlockState): number {
  if (job.status === 'done') return job.moves.length;
  if (job.status !== 'running') return 0;
  return job.moves.filter((m) => (job.kind === 'delivery' ? !block.containers[m.id] : !!block.containers[m.id])).length;
}

/** Container moves per hour of yard time, from the moves completed so far. */
export function movesPerHour(runner: JobRunner): number | null {
  if (runner.time < 60) return null;
  const done = runner.jobs.reduce((n, j) => n + movesDone(j, runner.crane.world.block), 0);
  return done / (runner.time / 3600);
}

/** Yard time as a wall clock, starting the shift at 08:00. */
export function yardClock(seconds: number): string {
  const t = 8 * 3600 + Math.floor(seconds);
  const h = Math.floor(t / 3600) % 24;
  const m = Math.floor((t % 3600) / 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Remembers when each job reached each stage, by watching snapshots go by. */
const stageTimes = new Map<string, number[]>();
export function recordStages(jobs: Job[], now: number) {
  for (const j of jobs) {
    const t = stageTimes.get(j.id) ?? [];
    if (t[0] === undefined) t[0] = now;
    for (let s = 1; s <= j.stage; s++) if (t[s] === undefined) t[s] = s === 1 && j.startedAt !== undefined ? j.startedAt : s === 4 && j.finishedAt !== undefined ? j.finishedAt : now;
    stageTimes.set(j.id, t);
  }
}
export const stageTimesOf = (id: string) => stageTimes.get(id) ?? [];
export const clearStageTimes = () => stageTimes.clear();
