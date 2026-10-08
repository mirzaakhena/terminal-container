import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { createStore } from '../lib/store';
import { Block, blockLength, blockWidth, demoFill, validBays } from '../models/yard';
import { SLOTS } from '../models/truck/loads';
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
  canLock: { ok: false, reason: '' } as LockResult,
  canRelease: { ok: false, reason: '' } as LockResult,
  location: '',
  atLimit: { gantry: [false, false], trolley: [false, false], hoist: [false, false] } as Record<AxisName, [boolean, boolean]>,
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
      const limit = (a: AxisName): [boolean, boolean] => {
        const ax = crane.axis(a);
        const low = a === 'hoist' ? crane.lowestHoist() : ax.min;
        return [ax.pos <= low + 1e-3, ax.pos >= ax.max - 1e-3];
      };
      store.set({
        pos: { gantry: crane.gantry.pos, trolley: crane.trolley.pos, hoist: crane.hoist.pos, spreader: crane.spreaderLength },
        carrying: crane.carried?.id ?? null,
        blocked: crane.blocked,
        canLock: crane.canLock(),
        canRelease: crane.canRelease(),
        location: describeLocation(),
        atLimit: { gantry: limit('gantry'), trolley: limit('trolley'), hoist: limit('hoist') },
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

const AXES: { name: AxisName; label: string; minus: string; plus: string; keys: [string, string] }[] = [
  { name: 'gantry', label: 'Gantry', minus: '◀ Back', plus: 'Forward ▶', keys: ['A', 'D'] },
  { name: 'trolley', label: 'Trolley', minus: '▲ To lane', plus: 'To block ▼', keys: ['W', 'S'] },
  { name: 'hoist', label: 'Hoist', minus: '▼ Lower', plus: 'Raise ▲', keys: ['F', 'R'] },
];
const KEYMAP: Record<string, [AxisName, -1 | 1]> = {
  a: ['gantry', -1], d: ['gantry', 1], arrowleft: ['gantry', -1], arrowright: ['gantry', 1],
  w: ['trolley', -1], s: ['trolley', 1], arrowup: ['trolley', -1], arrowdown: ['trolley', 1],
  f: ['hoist', -1], r: ['hoist', 1],
};

const pad = (n: number) => String(n).padStart(2, '0');

/** Where the spreader is, in operators' words: which bay or trailer position, which row or the lane. */
function describeLocation(): string {
  const near = (v: number, list: number[]) => list.findIndex((x) => Math.abs(x - v) < 0.05);
  const z = crane.trolley.pos;
  const zs = crane.snapPositions('trolley');
  const zi = near(z, zs);
  const across = zi === 0 ? 'truck lane' : zi > 0 ? `row ${pad(zi)}` : 'between rows';
  const x = crane.gantry.pos;
  let along = 'between bays';
  if (zi === 0) {
    for (const t of crane.world.trucks) {
      for (const slot of Object.values(SLOTS)) {
        if (Math.abs(t.x + slot.centreX - x) < 0.05 && slot.feet === crane.spreaderFeet) along = `${t.id} ${slot.label}`;
      }
    }
  } else {
    const bays = validBays(crane.world.block.config, crane.spreaderFeet === 20 ? '20GP' : '40GP');
    const xs = crane.snapPositions('gantry');
    const bi = near(x, xs);
    if (bi >= 0) along = `bay ${pad(bays[bi])}`;
  }
  return `${along} · ${across}`;
}

/** Hold-to-move: start on press, stop (and finish lining up) on release, also if the pointer slides off. */
function JogButton({ axis, dir, label, disabled }: { axis: AxisName; dir: -1 | 1; label: string; disabled: boolean }) {
  const start = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    crane.jog(axis, dir);
  };
  const end = () => crane.stopAndAlign(axis);
  return (
    <button className="jog" disabled={disabled} onPointerDown={start} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end}>
      {label}
    </button>
  );
}

function useKeyboard() {
  useEffect(() => {
    const held = new Set<string>();
    const typing = (e: KeyboardEvent) => e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement;
    const down = (e: KeyboardEvent) => {
      if (typing(e) || e.repeat) return;
      const k = e.key.toLowerCase();
      const m = KEYMAP[k];
      if (m) {
        e.preventDefault();
        held.add(k);
        crane.jog(m[0], m[1]);
      } else if (k === '2') report(crane.setSpreader(20), 'Spreader set to 20ft.');
      else if (k === '4') report(crane.setSpreader(40), 'Spreader set to 40ft.');
      else if (k === 'l') report(crane.lock(), 'Locked on.');
      else if (k === 'u') report(crane.release(), 'Released.');
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (!held.delete(k)) return;
      crane.stopAndAlign(KEYMAP[k][0]);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);
}

export function CranePanel() {
  const { pos, message, carrying, blocked, canLock, canRelease, location, atLimit } = store.use();
  useKeyboard();
  return (
    <div className="view-panel card crane-panel">
      <div className="panel-title">
        RTG-01 <span className="muted">· {carrying ? `holding ${carrying}` : 'spreader empty'}</span>
        <span className={carrying ? 'badge on' : 'badge'}>{carrying ? 'Locked' : 'Unlocked'}</span>
      </div>
      <div className="hint">Over {location}</div>
      {AXES.map(({ name, label, minus, plus, keys }) => (
        <div key={name} className="jog-row">
          <span>{label}</span>
          <JogButton axis={name} dir={-1} label={minus} disabled={atLimit[name][0]} />
          <JogButton axis={name} dir={1} label={plus} disabled={atLimit[name][1]} />
          <output>{pos[name].toFixed(2)} m</output>
          <kbd>{keys[0]}</kbd>
          <kbd>{keys[1]}</kbd>
        </div>
      ))}
      <div className="row-wrap">
        <div className="segmented">
          {([20, 40] as const).map((f) => (
            <button
              key={f}
              disabled={!!carrying}
              title={carrying ? 'Cannot change length while holding a container' : undefined}
              className={crane.spreaderFeet === f ? 'active' : ''}
              onClick={() => report(crane.setSpreader(f), `Spreader set to ${f}ft.`)}
            >
              {f}ft <kbd>{f === 20 ? '2' : '4'}</kbd>
            </button>
          ))}
        </div>
        <span className="hint">{pos.spreader.toFixed(2)} m</span>
        <button className="chip primary" disabled={!canLock.ok} title={canLock.ok ? undefined : canLock.reason} onClick={() => report(crane.lock(), 'Locked on.')}>
          Lock <kbd>L</kbd>
        </button>
        <button className="chip" disabled={!canRelease.ok} title={canRelease.ok ? undefined : canRelease.reason} onClick={() => report(crane.release(), 'Released.')}>
          Release <kbd>U</kbd>
        </button>
        <button className="chip" onClick={() => { crane = createScene(); exposeForDebugging(); store.set({ message: null }); bump(); }}>Reset</button>
      </div>
      <div className="hint">
        {!carrying ? (canLock.ok ? 'Ready to lock.' : canLock.reason) : canRelease.ok ? 'Ready to release.' : canRelease.reason}
        {blocked ? ` ${blocked}` : ''}
      </div>
      {message && (
        <div className={message.ok ? 'notice success' : 'notice'} role="status">
          {!message.ok && <strong>Refused. </strong>}
          {message.text}
          <button aria-label="Dismiss" onClick={() => store.set({ message: null })}>×</button>
        </div>
      )}
      <div className="hint">Hold a button or key to move; let go near a slot and the crane lines itself up. Arrow keys also move gantry and trolley.</div>
    </div>
  );
}
