import { CONTAINER_SPECS } from '../../models/container';
import { containersOnTop, formatAddress } from '../../models/yard';
import { yard, yardStore } from '../../views/YardView';
import { selectionStore, select } from './selection';
import { blockStats } from './yardStats';

function Bar({ value, tone = 'brand' }: { value: number; tone?: 'brand' | 'green' | 'amber' }) {
  return (
    <div className="bar"><div className={`bar-fill ${tone}`} style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }} /></div>
  );
}

function Stat({ label, value, sub, bar, tone }: { label: string; value: string | number; sub?: string; bar?: number; tone?: 'brand' | 'green' | 'amber' }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}{sub && <small> {sub}</small>}</strong>
      {bar !== undefined && <Bar value={bar} tone={tone} />}
    </div>
  );
}

function BlockDetail() {
  const block = yard.crane.world.block;
  const s = blockStats(block);
  const { bays, rows, tiers } = block.config;
  const tone = s.fill > 0.85 ? 'amber' : 'brand';
  return (
    <>
      <div className="detail-head">
        <div className="detail-icon block" />
        <div>
          <div className="eyebrow">BLOCK · CY-01</div>
          <div className="detail-title">Block A</div>
          <div className="hint">{bays} bays × {rows} rows · stacks up to {tiers} high</div>
        </div>
      </div>
      <div className="row-wrap">
        <span className={s.fill > 0.85 ? 'pill amber' : 'pill green'}>{s.fill > 0.85 ? 'Nearly full' : 'Operational'}</span>
        <span className="hint">{s.reachable} containers on top of their stacks</span>
      </div>
      <div className="stat-grid">
        <Stat label="Containers" value={s.teu} sub={`/ ${s.capacityTeu} TEU`} bar={s.fill} tone={tone} />
        <Stat label="Boxes" value={s.count} sub="in block" />
        <Stat label="20ft" value={s.byType['20GP']} bar={s.count ? s.byType['20GP'] / s.count : 0} />
        <Stat label="40ft / 40ft HC" value={`${s.byType['40GP']} / ${s.byType['40HC']}`} bar={s.count ? (s.byType['40GP'] + s.byType['40HC']) / s.count : 0} />
      </div>
    </>
  );
}

function CraneDetail() {
  const { jobs } = yardStore.use();
  const c = yard.crane;
  const job = jobs.find((j) => j.status === 'running');
  const status = job ? 'Working' : 'Idle';
  return (
    <>
      <div className="detail-head">
        <div className="detail-icon crane" />
        <div>
          <div className="eyebrow">RTG · BLOCK A</div>
          <div className="detail-title">RTG-01</div>
          <div className="hint">Rubber-tyred gantry · spans 6 rows + truck lane</div>
        </div>
      </div>
      <div className="row-wrap">
        <span className={job ? 'pill blue' : 'pill'}>{status}</span>
        <span className="hint">{job ? `${job.id}: ${job.step}` : 'No job running'}</span>
      </div>
      <div className="stat-grid">
        <Stat label="Gantry" value={`${c.gantry.pos.toFixed(1)} m`} bar={(c.gantry.pos - c.spec.gantry.min) / (c.spec.gantry.max - c.spec.gantry.min)} />
        <Stat label="Hoist" value={`${c.hoist.pos.toFixed(1)} m`} bar={c.hoist.pos / c.spec.hoist.max} />
        <Stat label="Spreader" value={`${c.spreaderFeet}ft`} sub={`${c.spreaderLength.toFixed(2)} m`} />
        <Stat label="Holding" value={c.carried ? c.carried.id : '—'} sub={c.carried ? CONTAINER_SPECS[c.carried.type].label : ''} />
      </div>
    </>
  );
}

function ContainerDetail({ id }: { id: string }) {
  const block = yard.crane.world.block;
  const box = block.containers[id];
  if (!box) {
    return (
      <>
        <div className="detail-title">{id}</div>
        <div className="hint">No longer in the yard.</div>
        <button className="chip" onClick={() => select({ kind: 'block' })}>Back to Block A</button>
      </>
    );
  }
  const above = containersOnTop(block, id);
  return (
    <>
      <div className="detail-head">
        <div className="detail-icon box" />
        <div>
          <div className="eyebrow">CONTAINER · BLOCK A</div>
          <div className="detail-title">{id}</div>
          <div className="hint">{CONTAINER_SPECS[box.type].label}</div>
        </div>
      </div>
      <div className="row-wrap">
        <span className={above.length ? 'pill amber' : 'pill green'}>{above.length ? 'Buried' : 'Reachable'}</span>
        <span className="hint">{above.length ? `under ${above.map((a) => a.id).join(', ')}` : 'nothing stacked on top'}</span>
      </div>
      <div className="stat-grid">
        <Stat label="Address" value={formatAddress(box)} sub="bay-row-tier" />
        <Stat label="Size" value={`${CONTAINER_SPECS[box.type].nominalFeet}ft`} sub={box.type === '40HC' ? 'High Cube' : 'standard'} />
      </div>
      <button className="chip" onClick={() => select({ kind: 'block' })}>Back to Block A</button>
    </>
  );
}

/** Right-hand panel: details of whatever is selected in the scene or found by search. */
export function DetailPanel() {
  const { selected } = selectionStore.use();
  yardStore.use((s) => s.time);
  return (
    <aside className="detail card" aria-label="Details">
      <div className="segmented detail-tabs">
        <button className={selected.kind === 'block' ? 'active' : ''} onClick={() => select({ kind: 'block' })}>Block A</button>
        <button className={selected.kind === 'crane' ? 'active' : ''} onClick={() => select({ kind: 'crane' })}>RTG-01</button>
      </div>
      {selected.kind === 'block' && <BlockDetail />}
      {selected.kind === 'crane' && <CraneDetail />}
      {selected.kind === 'container' && <ContainerDetail id={selected.id} />}
      <div className="hint">Click the block or the crane in the scene to switch.</div>
    </aside>
  );
}
