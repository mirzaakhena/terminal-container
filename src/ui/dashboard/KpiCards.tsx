import type { ReactNode } from 'react';
import { yard, yardStore } from '../../views/YardView';
import { ContainerIcon, CraneIcon, ListIcon, TruckIcon } from '../icons';
import { blockStats, movesPerHour } from './yardStats';

function Kpi({ icon, label, value, detail }: { icon: ReactNode; label: string; value: ReactNode; detail: ReactNode }) {
  return (
    <div className="kpi card">
      <div className="kpi-icon">{icon}</div>
      <div>
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">{value}</div>
        <div className="kpi-detail">{detail}</div>
      </div>
    </div>
  );
}

/** Headline figures across the top, as in the reference's stock / trucks / on-time cards. */
export function KpiCards() {
  const { jobs, truckOnSite } = yardStore.use();
  const stats = blockStats(yard.crane.world.block);
  const mph = movesPerHour(yard);
  const queued = jobs.filter((j) => j.status === 'queued').length;
  const done = jobs.filter((j) => j.status === 'done').length;
  return (
    <div className="kpis">
      <Kpi
        icon={<ContainerIcon />}
        label="Containers in yard"
        value={stats.count}
        detail={`${stats.teu} TEU · ${Math.round(stats.fill * 100)}% of Block A`}
      />
      <Kpi
        icon={<TruckIcon />}
        label="Trucks on site"
        value={truckOnSite ? 1 : 0}
        detail={truckOnSite ? `${truckOnSite.id} ${truckOnSite.phase === 'touring' ? 'on a demo drive' : truckOnSite.phase}` : queued ? `${queued} waiting at the gate` : 'none waiting'}
      />
      <Kpi
        icon={<CraneIcon />}
        label="Crane moves / hour"
        value={mph === null ? '—' : mph.toFixed(1)}
        detail="RTG-01 · yard time"
      />
      <Kpi icon={<ListIcon />} label="Jobs" value={`${done}/${jobs.length}`} detail={`done · ${queued} queued`} />
    </div>
  );
}
