import { CONTAINER_SPECS } from '../../models/container';
import { formatAddress } from '../../models/yard';
import { JOB_STAGES, type Job } from '../../sim/jobs';
import { yardStore } from '../../views/YardView';
import { CheckIcon, ClockIcon, ContainerIcon, CraneIcon, TruckIcon } from '../icons';
import { stageTimesOf, yardClock } from './yardStats';

const STAGE_ICONS = [<ClockIcon key="q" />, <TruckIcon key="a" />, <CraneIcon key="c" />, <TruckIcon key="l" />, <CheckIcon key="d" />];

/** A job to show before any has run, so the strip is never empty. */
const SAMPLE: Job = {
  id: 'SAMPLE', kind: 'delivery', truckId: 'TRK-00', status: 'queued', stage: 0, step: 'Queue a job to see it here',
  moves: [{ id: 'TCKU0000000', type: '20GP', color: 0, slot: 'centre20', address: { bay: 1, row: 1, tier: 1 } }],
};

/** Bottom strip: the current job's progress through its stages, like the reference's shipment tracking. */
export function JobTimeline() {
  const { jobs } = yardStore.use();
  const job = jobs.find((j) => j.status === 'running') ?? [...jobs].reverse().find((j) => j.status === 'done' || j.status === 'failed') ?? jobs.find((j) => j.status === 'queued') ?? SAMPLE;
  const times = stageTimesOf(job.id);
  const sample = job === SAMPLE;
  return (
    <section className="timeline card" aria-label="Job progress">
      <div className="timeline-head">
        <TruckIcon />
        <strong>Job Tracking</strong>
        <span className="muted">{sample ? 'sample' : `${job.id} · ${job.truckId}`}</span>
      </div>
      <ol className="stages">
        {JOB_STAGES.map((name, i) => {
          const state = job.stage > i || job.status === 'done' ? 'done' : job.stage === i && job.status !== 'queued' ? 'now' : i === 0 && !sample ? 'done' : 'todo';
          return (
            <li key={name} className={`stage ${state}`}>
              <span className="stage-dot">{STAGE_ICONS[i]}</span>
              <span className="stage-name">{name}</span>
              <span className="stage-time">{times[i] !== undefined ? yardClock(times[i]) : '—'}</span>
            </li>
          );
        })}
      </ol>
      <div className="timeline-job">
        <ContainerIcon />
        <div>
          <strong>{job.moves.map((m) => m.id).join(' + ')}</strong>
          <div className="hint">
            {job.kind === 'delivery' ? 'From' : 'To'} {job.moves.map((m) => formatAddress(m.address)).join(', ')} ·{' '}
            {job.moves.map((m) => `${CONTAINER_SPECS[m.type].nominalFeet}ft`).join(' + ')}
          </div>
          <span className={`pill ${job.status === 'running' ? 'blue' : job.status === 'done' ? 'green' : job.status === 'failed' || job.status === 'refused' ? 'amber' : ''}`}>{sample ? 'Sample' : job.status === 'running' ? JOB_STAGES[job.stage] : job.status === 'failed' ? 'stopped' : job.status}</span>
          <div className="hint">{job.step}</div>
        </div>
      </div>
    </section>
  );
}
