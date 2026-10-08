import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { createStore } from '../lib/store';
import { Block, blockLength, blockWidth, demoFill } from '../models/yard';
import { Truck } from '../models/truck';
import { CraneController, LANE_WIDTH, LANE_Z, RtgCrane, craneSpec, type AxisName, type LockResult } from '../models/crane';
import type { World } from '../sim/world';
import { RoadRibbon } from '../scene/RoadRibbon';
import { MeshBasicMaterial } from 'three';
import { palette } from '../config/theme';
import { DEFAULT_BLOCK } from './BlockView';

/** One block, one truck parked in the lane beside it, one crane. Shared by this view and its panel. */
function createScene() {
  const world: World = {
    block: demoFill(DEFAULT_BLOCK, 11, 0.5),
    trucks: [{ id: 'TRK-01', x: 34, z: LANE_Z, load: {}, ids: {}, colors: {} }],
  };
  return new CraneController(craneSpec(DEFAULT_BLOCK), world, { gantry: 20 });
}

let crane = createScene();
/** Development aid: lets a browser console (or a test script) drive the crane directly. */
const exposeForDebugging = () => {
  if (import.meta.env.DEV) (window as unknown as { __porttrack: unknown }).__porttrack = { crane, bump: () => bump() };
};
const store = createStore({
  version: 0,
  message: null as null | { ok: boolean; text: string },
  pos: { gantry: crane.gantry.pos, trolley: crane.trolley.pos, hoist: crane.hoist.pos, spreader: crane.spreaderLength },
  carrying: null as string | null,
  blocked: null as string | null,
});

const bump = () => store.set((s) => ({ version: s.version + 1 }));
exposeForDebugging();
const laneMat = new MeshBasicMaterial({ color: palette.asphalt });
const laneLineMat = new MeshBasicMaterial({ color: palette.marking });

const L = blockLength(DEFAULT_BLOCK);
const W = blockWidth(DEFAULT_BLOCK);

export function CraneView() {
  store.use((s) => s.version); // re-render only when the world changes (lock, release, reset)
  const last = useRef(0);

  useFrame((state, dt) => {
    crane.step(Math.min(dt, 0.1));
    if (state.clock.elapsedTime - last.current > 0.1) {
      last.current = state.clock.elapsedTime;
      store.set({
        pos: { gantry: crane.gantry.pos, trolley: crane.trolley.pos, hoist: crane.hoist.pos, spreader: crane.spreaderLength },
        carrying: crane.carried?.id ?? null,
        blocked: crane.blocked,
      });
    }
  });

  const lane: [number, number][] = [[-8, LANE_Z], [L + 8, LANE_Z]];
  return (
    <group position={[-L / 2, 0, -W / 2]}>
      <RoadRibbon points={lane} width={LANE_WIDTH} material={laneMat} />
      <RoadRibbon points={[[-8, LANE_Z - LANE_WIDTH / 2], [L + 8, LANE_Z - LANE_WIDTH / 2]]} width={0.12} y={0.015} material={laneLineMat} />
      <Block state={crane.world.block} name="Block A" bayLabelZ={crane.spec.legZ[0] - 1.6} />
      {crane.world.trucks.map((t) => (
        <Truck key={t.id} position={[t.x, 0, t.z]} load={t.load} colors={t.colors} />
      ))}
      <RtgCrane crane={crane} />
    </group>
  );
}

function report(r: LockResult, okText: string) {
  store.set({ message: r.ok ? { ok: true, text: okText } : { ok: false, text: r.reason } });
  bump();
}

const AXES: { name: AxisName; label: string }[] = [
  { name: 'gantry', label: 'Gantry (along block)' },
  { name: 'trolley', label: 'Trolley (across)' },
  { name: 'hoist', label: 'Hoist (height)' },
];

export function CranePanel() {
  const { pos, message, carrying, blocked } = store.use();
  const s = crane.spec;
  const range = { gantry: s.gantry, trolley: s.trolley, hoist: s.hoist };
  return (
    <div className="view-panel card">
      <div className="panel-title">RTG-01 <span className="muted">· {carrying ? `holding ${carrying}` : 'spreader empty'}</span></div>
      {AXES.map(({ name, label }) => (
        <label key={name} className="slider">
          <span>{label}</span>
          <input
            type="range"
            min={range[name].min}
            max={range[name].max}
            step={0.05}
            value={crane.axis(name).target}
            onChange={(e) => crane.moveTo(name, +e.target.value)}
          />
          <output>{pos[name].toFixed(2)} m</output>
        </label>
      ))}
      <div className="row-wrap">
        <div className="segmented">
          {([20, 40] as const).map((f) => (
            <button key={f} className={crane.spreaderFeet === f ? 'active' : ''} onClick={() => report(crane.setSpreader(f), `Spreader set to ${f}ft.`)}>
              {f}ft
            </button>
          ))}
        </div>
        <span className="hint">{pos.spreader.toFixed(2)} m</span>
        <button className="chip primary" onClick={() => report(crane.lock(), 'Locked on.')}>Lock</button>
        <button className="chip" onClick={() => report(crane.release(), 'Released.')}>Release</button>
        <button className="chip" onClick={() => { crane = createScene(); exposeForDebugging(); store.set({ message: null }); bump(); }}>Reset</button>
      </div>
      {blocked && !message && <div className="hint">{blocked}</div>}
      {message && (
        <div className={message.ok ? 'notice success' : 'notice'} role="status">
          {!message.ok && <strong>Refused. </strong>}
          {message.text}
          <button aria-label="Dismiss" onClick={() => store.set({ message: null })}>×</button>
        </div>
      )}
    </div>
  );
}
