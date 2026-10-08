import { yard, yardStore } from '../../views/YardView';
import { DetailPanel } from './DetailPanel';
import { FleetTable } from './FleetTable';
import { JobTimeline } from './JobTimeline';
import { KpiCards } from './KpiCards';
import { recordStages } from './yardStats';

/** The operations overlay on the Yard view, laid out like the style reference. */
export function Dashboard() {
  const { jobs } = yardStore.use();
  recordStages(jobs, yard.time);
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
