import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshBasicMaterial, type Group } from 'three';
import { palette } from '../config/theme';
import { createStore } from '../lib/store';
import { CONTAINER_SPECS, type ContainerType } from '../models/container';
import { Block, blockLength, blockWidth, demoFill, formatAddress } from '../models/yard';
import { Tractor, Trailer, Truck } from '../models/truck';
import { CraneController, LANE_WIDTH, RtgCrane, craneSpec } from '../models/crane';
import { sampleRoute } from '../motion/route';
import { JOB_STAGES, JobRunner, suggestDelivery, suggestReceiving, type Address, type Job, type Pause } from '../sim/jobs';
import type { World } from '../sim/world';
import { RoadRibbon } from '../scene/RoadRibbon';
import { Label } from '../scene/Label';
import { DEFAULT_BLOCK } from './BlockView';
import { select } from '../ui/dashboard/selection';
import { clearStageTimes } from '../ui/dashboard/yardStats';
import type { ThreeEvent } from '@react-three/fiber';
import { debugHandle } from '../lib/debug';

/** The whole terminal: one block, its crane, and trucks coming and going for queued jobs. */
function createYard() {
  const world: World = { block: demoFill(DEFAULT_BLOCK, 23, 0.45), trucks: [] };
  const crane = new CraneController(craneSpec(DEFAULT_BLOCK), world, { gantry: blockLength(DEFAULT_BLOCK) / 2 });
  return new JobRunner(crane, blockLength(DEFAULT_BLOCK));
}

export let yard = createYard();

/** Shared with the dashboard: a snapshot of the yard refreshed a few times a second. */
export const yardStore = createStore({
  version: 0,
  speed: 1,
  jobs: [] as Job[],
  time: 0,
  containers: Object.keys(yard.crane.world.block.containers).length,
  truckOnSite: null as null | { id: string; phase: string },
  paused: null as Pause | null,
  message: null as null | { ok: boolean; text: string },
});

const bump = () => yardStore.set((s) => ({ version: s.version + 1 }));
const exposeForDebugging = () => {
  if (import.meta.env.DEV) debugHandle().yard = { runner: yard, bump: () => bump() };
};
exposeForDebugging();

export function resetYard() {
  yard = createYard();
  clearStageTimes();
  exposeForDebugging();
  yardStore.set({ jobs: [], time: 0, message: null });
  bump();
}

const L = blockLength(DEFAULT_BLOCK);
const W = blockWidth(DEFAULT_BLOCK);
const laneMat = new MeshBasicMaterial({ color: palette.asphalt });
const laneLineMat = new MeshBasicMaterial({ color: '#ffffff' });

/** Pointer handlers that make a part of the scene clickable, with a hand cursor on hover. */
function pickable(onPick: () => void) {
  return {
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      onPick();
    },
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      document.body.style.cursor = 'pointer';
    },
    onPointerOut: () => {
      document.body.style.cursor = '';
    },
  };
}

/** The truck while it drives: pose read from its motion every frame. */
function DrivingTruck() {
  const truck = useRef<Group>(null);
  const trailer = useRef<Group>(null);
  const t = yard.truck;
  useFrame(() => {
    const cur = yard.truck;
    if (!cur || !truck.current || !trailer.current) return;
    const p = cur.motion.pose();
    truck.current.position.set(p.x, 0, p.z);
    truck.current.rotation.set(0, p.heading, 0);
    trailer.current.rotation.set(0, -p.articulation, 0);
  });
  if (!t || t.phase === 'parked') return null;
  return (
    <group ref={truck}>
      <Tractor />
      <group ref={trailer}>
        <Trailer load={t.load} colors={t.colors} />
      </group>
    </group>
  );
}

export function YardView() {
  yardStore.use((s) => s.version);
  const last = useRef({ t: 0, world: yard.crane.world, truck: '' });
  const road = useMemo(() => sampleRoute(yard.route, 0.5), []);

  useFrame((state, dt) => {
    yard.step(Math.min(dt, 0.1) * yardStore.get().speed);
    const truckKey = yard.truck ? `${yard.truck.id}:${yard.truck.phase}` : '';
    // Redraw the scene only when what is in it changes (a lock, a release, a truck arriving or leaving).
    if (yard.crane.world !== last.current.world || truckKey !== last.current.truck) {
      last.current.world = yard.crane.world;
      last.current.truck = truckKey;
      bump();
    }
    if (state.clock.elapsedTime - last.current.t > 0.2) {
      last.current.t = state.clock.elapsedTime;
      yardStore.set({
        jobs: yard.jobs.map((j) => ({ ...j })),
        time: yard.time,
        containers: Object.keys(yard.crane.world.block.containers).length,
        truckOnSite: yard.truck ? { id: yard.truck.id, phase: yard.truck.phase } : null,
        paused: yard.paused ? { ...yard.paused, refused: [...yard.paused.refused] } : null,
      });
    }
  });

  const gate = yard.route.at(0);
  return (
    <group position={[-L / 2, 0, -W / 2]}>
      <RoadRibbon points={road} width={LANE_WIDTH} material={laneMat} />
      <RoadRibbon points={road} width={0.12} y={0.015} material={laneLineMat} />
      <Label position={[gate.x + 6, 0.1, gate.z - 4]} title="Gate" />
      <group {...pickable(() => select({ kind: 'block' }))}>
        <Block state={yard.crane.world.block} name="Block A" bayLabelZ={yard.crane.spec.legZ[0] - 1.6} />
      </group>
      {yard.crane.world.trucks.map((t) => (
        <Truck key={t.id} position={[t.x, 0, t.z]} load={t.load} colors={t.colors} />
      ))}
      <DrivingTruck key={yard.truck ? `${yard.truck.id}:${yard.truck.phase}` : 'none'} />
      <group {...pickable(() => select({ kind: 'crane' }))}>
        <RtgCrane crane={yard.crane} />
      </group>
    </group>
  );
}

// ─── Panel ──────────────────────────────────────────────────────────────────────────────────────────

const SIZES: { id: string; label: string; types: ContainerType[] }[] = [
  { id: '1x20', label: '1 × 20ft', types: ['20GP'] },
  { id: '2x20', label: '2 × 20ft', types: ['20GP', '20GP'] },
  { id: '1x40', label: '1 × 40ft', types: ['40GP'] },
  { id: '1x40hc', label: '1 × 40ft HC', types: ['40HC'] },
];

const blank = (): Address => ({ bay: 1, row: 1, tier: 1 });

function AddressInput({ value, onChange, label }: { value: Address; onChange(a: Address): void; label: string }) {
  const field = (k: keyof Address) => (
    <input type="number" min={1} value={value[k]} aria-label={`${label} ${k}`} title={k} onChange={(e) => onChange({ ...value, [k]: +e.target.value })} />
  );
  return (
    <div className="row-wrap">
      <span className="hint address-label">{label}</span>
      {field('bay')}
      {field('row')}
      {field('tier')}
    </div>
  );
}

const describeJob = (j: Job) =>
  j.moves.map((m) => `${CONTAINER_SPECS[m.type].nominalFeet}ft ${j.kind === 'delivery' ? 'from' : 'to'} ${formatAddress(m.address)}`).join(' + ');

export function YardPanel() {
  const { jobs, speed, message, paused } = yardStore.use();
  const [kind, setKind] = useState<'delivery' | 'receiving'>('delivery');
  const [sizeId, setSizeId] = useState('1x20');
  const size = SIZES.find((s) => s.id === sizeId)!;
  const [addrs, setAddrs] = useState<Address[]>([blank(), blank()]);
  const n = size.types.length;
  const [collapsed, setCollapsed] = useState(true);

  const say = (ok: boolean, text: string) => yardStore.set({ message: { ok, text } });

  const suggest = () => {
    const a = kind === 'delivery' ? suggestDelivery(yard.planned, size.types) : suggestReceiving(yard.planned, size.types);
    if (!a) return say(false, kind === 'delivery' ? `No ${size.label} containers can be reached right now.` : 'No free slots for that size.');
    setAddrs([a[0], a[1] ?? blank()]);
  };

  const add = () => {
    const chosen = addrs.slice(0, n);
    const r = kind === 'delivery' ? yard.add({ kind, from: chosen, types: size.types }) : yard.add({ kind, types: size.types, to: chosen });
    if (r.ok) say(true, `${r.job.id} queued: ${r.job.truckId}, ${describeJob(r.job)}.`);
    else say(false, r.reason);
  };

  const demo = () => {
    const plan: [typeof kind, ContainerType[]][] = [
      ['delivery', ['20GP', '20GP']], ['receiving', ['40HC']], ['delivery', ['40GP']], ['receiving', ['20GP']],
    ];
    let added = 0;
    for (const [k, types] of plan) {
      const a = k === 'delivery' ? suggestDelivery(yard.planned, types) : suggestReceiving(yard.planned, types);
      if (!a) continue;
      const r = k === 'delivery' ? yard.add({ kind: k, from: a, types }) : yard.add({ kind: k, types, to: a });
      if (r.ok) added++;
    }
    say(true, `${added} demo jobs queued.`);
  };

  const visible = jobs.slice(-4).reverse();
  const resume = () => {
    const r = yard.resume();
    say(r.ok, r.ok ? 'Queue resumed.' : r.reason);
  };
  const pauseBanner = paused && (
    <div className="notice pause" role="alert">
      <strong>Queue paused.</strong> {paused.jobId} stopped: {paused.reason}
      {paused.recovering ? ' Putting things right…' : paused.refused.length ? ` Re-checked the queue: ${paused.refused.join(', ')} can no longer be done.` : ' Re-checked the queue: the remaining jobs can still be done.'}
      <div className="row-wrap">
        <button className="chip primary" disabled={paused.recovering} onClick={resume}>Resume queue</button>
      </div>
    </div>
  );
  return (
    <div className="view-panel card yard-panel">
      <div className="panel-title panel-head">
        Crane jobs <span className="muted">· RTG-01, Block A</span>
        <button className="chip" onClick={() => setCollapsed((c) => !c)} aria-expanded={!collapsed}>
          {collapsed ? 'Show' : 'Hide'}
        </button>
      </div>
      {pauseBanner}
      {collapsed ? (
        (() => {
          const j = jobs.find((x) => x.status === 'running') ?? visible[0];
          return j ? <div className="hint">{j.id} · {j.status === 'running' ? j.step : j.status}</div> : <div className="hint">No jobs yet — Show to add one.</div>;
        })()
      ) : (
      <>
      <div className="row-wrap">
        <div className="segmented">
          {(['delivery', 'receiving'] as const).map((k) => (
            <button key={k} className={kind === k ? 'active' : ''} onClick={() => setKind(k)}>
              {k === 'delivery' ? 'Delivery (block → truck)' : 'Receiving (truck → block)'}
            </button>
          ))}
        </div>
      </div>
      <div className="row-wrap">
        <div className="segmented">
          {SIZES.map((s) => (
            <button key={s.id} className={sizeId === s.id ? 'active' : ''} onClick={() => setSizeId(s.id)}>{s.label}</button>
          ))}
        </div>
      </div>
      {Array.from({ length: n }, (_, i) => (
        <AddressInput
          key={i}
          label={n > 1 ? `${kind === 'delivery' ? 'From' : 'To'} #${i + 1}` : kind === 'delivery' ? 'From' : 'To'}
          value={addrs[i]}
          onChange={(a) => setAddrs((prev) => prev.map((p, j) => (j === i ? a : p)))}
        />
      ))}
      <div className="row-wrap">
        <button className="chip" onClick={suggest}>Pick for me</button>
        <button className="chip primary" onClick={add}>Queue job</button>
        <button className="chip" onClick={demo}>Queue demo jobs</button>
        <span className="hint">Speed</span>
        <div className="segmented">
          {[1, 4, 10].map((v) => (
            <button key={v} className={speed === v ? 'active' : ''} onClick={() => yardStore.set({ speed: v })}>{v}×</button>
          ))}
        </div>
        <button className="chip" onClick={resetYard}>Reset</button>
      </div>
      <div className="hint">Addresses are bay-row-tier. 20ft bays are odd (01, 03 …); 40ft bays are 02, 06, 10 ….</div>
      {message && (
        <div className={message.ok ? 'notice success' : 'notice'} role="status">
          {!message.ok && <strong>Refused. </strong>}
          {message.text}
          <button aria-label="Dismiss" onClick={() => yardStore.set({ message: null })}>×</button>
        </div>
      )}
      {visible.length > 0 && (
        <ul className="job-list">
          {visible.map((j) => (
            <li key={j.id} className={`job ${j.status}`}>
              <div>
                <strong>{j.id}</strong> <span className="muted">{j.kind} · {j.truckId}</span>
                <span className={`status ${j.status}`}>{j.status === 'running' ? JOB_STAGES[j.stage] : j.status === 'failed' ? 'stopped' : j.status}</span>
              </div>
              <div className="hint">{describeJob(j)}</div>
              {j.status === 'running' && <div className="hint step">{j.step}</div>}
              {(j.status === 'failed' || j.status === 'refused') && <div className="hint">{j.error}</div>}
            </li>
          ))}
        </ul>
      )}
      </>
      )}
    </div>
  );
}
