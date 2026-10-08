import { useState } from 'react';
import { CONTAINER_SPECS } from '../../models/container';
import type { Job } from '../../sim/jobs';
import { yard, yardStore } from '../../views/YardView';
import { movesDone } from './yardStats';

const truckStatus = (j: Job): { text: string; tone: string } => {
  if (j.status === 'queued') return { text: 'At gate', tone: '' };
  if (j.status === 'failed') return { text: 'Stopped', tone: 'amber' };
  if (j.status === 'done') return { text: 'Left', tone: 'green' };
  return [
    { text: 'Waiting', tone: '' },
    { text: 'Arriving', tone: 'blue' },
    { text: j.kind === 'delivery' ? 'Loading' : 'Unloading', tone: 'blue' },
    { text: 'Leaving', tone: 'blue' },
    { text: 'Left', tone: 'green' },
  ][j.stage];
};

/** Bottom-right table of equipment and its status, with tabs as in the reference's docks/forklifts/trucks. */
export function FleetTable() {
  const { jobs } = yardStore.use();
  const [tab, setTab] = useState<'cranes' | 'trucks'>('trucks');
  const running = jobs.find((j) => j.status === 'running');
  const trucks = [...jobs].reverse().slice(0, 4);
  const block = yard.crane.world.block;
  return (
    <section className="fleet card" aria-label="Equipment">
      <div className="fleet-head">
        <div className="segmented">
          <button className={tab === 'cranes' ? 'active' : ''} onClick={() => setTab('cranes')}>Cranes <span className="muted">{running ? 1 : 0}/1</span></button>
          <button className={tab === 'trucks' ? 'active' : ''} onClick={() => setTab('trucks')}>Trucks <span className="muted">{jobs.length}</span></button>
        </div>
        <span className="hint">Block A</span>
      </div>
      <table>
        <tbody>
          {tab === 'cranes' ? (
            <tr>
              <td><strong>RTG-01</strong><div className="hint">Block A</div></td>
              <td>{running ? `${running.id} · ${running.truckId}` : 'No job'}</td>
              <td><span className={running ? 'pill blue' : 'pill'}>{running ? 'Working' : 'Idle'}</span></td>
              <td className="num">{running ? `${movesDone(running, block)}/${running.moves.length}` : ''}</td>
            </tr>
          ) : trucks.length ? (
            trucks.map((j) => {
              const st = truckStatus(j);
              const done = movesDone(j, block);
              return (
                <tr key={j.id}>
                  <td><strong>{j.truckId}</strong><div className="hint">{j.kind}</div></td>
                  <td>{j.moves.map((m) => `${CONTAINER_SPECS[m.type].nominalFeet}ft`).join(' + ')}</td>
                  <td><span className={`pill ${st.tone}`}>{st.text}</span></td>
                  <td className="num">
                    <div className="mini-bar"><div style={{ width: `${(done / j.moves.length) * 100}%` }} /></div>
                    {done}/{j.moves.length}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr><td colSpan={4} className="hint">No trucks yet — queue a job.</td></tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
