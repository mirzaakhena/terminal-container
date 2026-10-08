import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferGeometry, Float32BufferAttribute, type Group, Line, LineBasicMaterial, MeshBasicMaterial } from 'three';
import { palette } from '../config/theme';
import { Tractor, Trailer, type TrailerLoad } from '../models/truck';
import { createRoute, sampleRoute } from '../motion/route';
import { TruckMotion } from '../motion/truckMotion';
import { createStore } from '../lib/store';
import { RoadRibbon } from '../scene/RoadRibbon';
import { Label } from '../scene/Label';

/** Demo route: in from the gate, two right-angle corners, along a lane and out. */
const ROUTE = createRoute(
  [[-70, 22], [10, 22], [10, -14], [-60, -14]],
  14,
  { Gate: 0, 'First corner': 1, 'Second corner': 2, Exit: 3 },
);
// The crane lane stop sits halfway along the last straight.
ROUTE.stops['Crane lane'] = ROUTE.stops['Second corner'] + (ROUTE.length - ROUTE.stops['Second corner']) / 2;
const STOP_ORDER = ['First corner', 'Second corner', 'Crane lane', 'Exit'];
const LOAD: TrailerLoad = { full40: '40HC' };

const store = createStore({
  command: null as null | { kind: 'drive'; stop: string } | { kind: 'reset' },
  speed: 0,
  articulation: 0,
  s: 0,
  moving: false,
  showTrace: true,
  error: null as string | null,
});

const roadMat = new MeshBasicMaterial({ color: palette.asphalt });
const lineMat = new MeshBasicMaterial({ color: '#ffffff' });
const TRACE_POINTS = 4000;

export function DriveView() {
  const motion = useMemo(() => new TruckMotion(ROUTE), []);
  const truck = useRef<Group>(null);
  const trailer = useRef<Group>(null);
  const traceCount = useRef(0);
  const lastReport = useRef(0);
  const { showTrace } = store.use();

  const road = useMemo(() => sampleRoute(ROUTE, 0.5), []);
  const traceGeom = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(new Float32Array(TRACE_POINTS * 3), 3));
    g.setDrawRange(0, 0);
    return g;
  }, []);
  const trace = useMemo(() => new Line(traceGeom, new LineBasicMaterial({ color: palette.brand })), [traceGeom]);

  useEffect(() => () => store.set({ command: null }), []);

  useFrame((state, dt) => {
    const cmd = store.get().command;
    if (cmd) {
      store.set({ command: null, error: null });
      try {
        if (cmd.kind === 'reset') {
          motion.reset();
          traceCount.current = 0;
          traceGeom.setDrawRange(0, 0);
        } else motion.driveTo(cmd.stop);
      } catch (e) {
        store.set({ error: (e as Error).message });
      }
    }
    motion.step(Math.min(dt, 0.1));
    const p = motion.pose();
    truck.current?.position.set(p.x, 0, p.z);
    truck.current?.rotation.set(0, p.heading, 0);
    trailer.current?.rotation.set(0, -p.articulation, 0);

    if (motion.moving && traceCount.current < TRACE_POINTS) {
      const a = traceGeom.getAttribute('position') as Float32BufferAttribute;
      a.setXYZ(traceCount.current++, p.trailerAxle[0], 0.05, p.trailerAxle[1]);
      a.needsUpdate = true;
      traceGeom.setDrawRange(0, traceCount.current);
    }
    if (state.clock.elapsedTime - lastReport.current > 0.1) {
      lastReport.current = state.clock.elapsedTime;
      store.set({ speed: p.speed, articulation: p.articulation, s: p.s, moving: motion.moving });
    }
  });

  return (
    <group>
      <RoadRibbon points={road} width={6} material={roadMat} />
      <RoadRibbon points={road} width={0.15} y={0.015} material={lineMat} />
      {Object.entries(ROUTE.stops).filter(([n]) => n !== 'First corner' && n !== 'Second corner').map(([name, s]) => {
        const p = ROUTE.at(s);
        return <Label key={name} position={[p.x, 0.1, p.z + 4.5]} title={name} />;
      })}
      <primitive object={trace} visible={showTrace} />
      <group ref={truck}>
        <Tractor />
        <group ref={trailer}>
          <Trailer load={LOAD} colors={{ full40: 4 }} />
        </group>
      </group>
    </group>
  );
}

const deg = (r: number) => Math.round((r * 180) / Math.PI);

export function DrivePanel() {
  const { speed, articulation, s, moving, showTrace, error } = store.use();
  const nextStops = STOP_ORDER.filter((n) => ROUTE.stops[n] > s + 0.05);
  return (
    <div className="view-panel card">
      <div className="panel-title">Truck TRK-01 <span className="muted">· 1 × 40ft HC</span></div>
      <div className="readouts">
        <div><span>Speed</span><strong>{(speed * 3.6).toFixed(1)} km/h</strong></div>
        <div><span>Trailer angle</span><strong>{deg(articulation)}°</strong></div>
        <div><span>Distance</span><strong>{s.toFixed(1)} m</strong></div>
      </div>
      <div className="row-wrap">
        {STOP_ORDER.map((n) => (
          <button key={n} className="chip" disabled={moving || !nextStops.includes(n)} onClick={() => store.set({ command: { kind: 'drive', stop: n } })}>
            Drive to {n}
          </button>
        ))}
        <button className="chip" disabled={moving} onClick={() => store.set({ command: { kind: 'reset' } })}>Back to gate</button>
      </div>
      <label className="check">
        <input type="checkbox" checked={showTrace} onChange={(e) => store.set({ showTrace: e.target.checked })} />
        Show the trailer wheels' path (blue) against the lane centre (white)
      </label>
      {error && <div className="notice" role="alert">{error}</div>}
    </div>
  );
}
