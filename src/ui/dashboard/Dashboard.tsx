import { useEffect } from 'react';
import { yard, yardStore } from '../../views/YardView';
import { DetailPanel } from './DetailPanel';
import { FleetTable } from './FleetTable';
import { JobTimeline } from './JobTimeline';
import { KpiCards } from './KpiCards';
import { recordStages } from './yardStats';
import { recordEvents } from './events';

/** The operations overlay on the Yard view, laid out like the style reference. */
export function Dashboard() {
  const { jobs } = yardStore.use();
  recordStages(jobs, yard.time);
  // Other components listen to events, so record them after rendering, not during.
  useEffect(() => recordEvents(jobs, yard.time), [jobs]);
  return (
    <>
      <KpiCards />
      <DetailPanel />
      <div className="dash-bottom">
        <JobTimeline />
        <FleetTable />
      </div>
    </>
  );
}
