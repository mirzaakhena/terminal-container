import { CONTAINER_SPECS, type ContainerType } from '../models/container';
import { Tractor, Trailer, Truck, planLoad, type TrailerLoad } from '../models/truck';
import { createStore } from '../lib/store';
import { Label } from '../scene/Label';
import { TRAILER, TRACTOR } from '../models/truck';

interface Preset {
  id: string;
  label: string;
  types: ContainerType[];
}

const PRESETS: Preset[] = [
  { id: 'empty', label: 'Empty', types: [] },
  { id: '1x20', label: '1 × 20ft', types: ['20GP'] },
  { id: '2x20', label: '2 × 20ft', types: ['20GP', '20GP'] },
  { id: '1x40', label: '1 × 40ft', types: ['40GP'] },
  { id: '1x40hc', label: '1 × 40ft HC', types: ['40HC'] },
];

/** A load the trailer cannot take, to show that it is refused rather than drawn. */
const INVALID: Preset = { id: '3x20', label: '3 × 20ft', types: ['20GP', '20GP', '20GP'] };

const store = createStore<{ presetId: string; load: TrailerLoad; message: string | null }>({
  presetId: '2x20',
  load: { front20: '20GP', rear20: '20GP' },
  message: null,
});

function choose(p: Preset) {
  const r = planLoad(p.types);
  if (r.ok) store.set({ presetId: p.id, load: r.load, message: null });
  else store.set({ message: r.reason });
}

const COLORS = { full40: 0, front20: 2, rear20: 1, centre20: 3 };

/** The truck on its own: coupled truck with a switchable load, plus tractor and trailer apart to show the coupling. */
export function TruckView() {
  const { load } = store.use();
  const legX = TRAILER.landingLegX;
  return (
    <group position={[2, 0, -4]}>
      <Truck load={load} colors={COLORS} />
      <Label position={[TRACTOR.cab.frontX - 1, TRACTOR.cab.topY + 1.2, 0]} title="Tractor + skeletal trailer" detail={describeLoad(load)} />

      {/* Apart: trailer standing on its landing legs, tractor pulled forward. */}
      <group position={[0, 0, 7]}>
        <Trailer legsDown />
        <Tractor position={[6, 0, 0]} />
        <Label position={[0.6, 0.7, 2.2]} title="Kingpin" detail="under the trailer's front plate" />
        <Label position={[6, 2.6, 0]} title="Fifth wheel" detail="takes the kingpin when coupled" />
        <Label position={[legX - 3.5, 0.4, 2.4]} title="Landing legs" detail="down when uncoupled" />
      </group>
    </group>
  );
}

function describeLoad(load: TrailerLoad): string {
  const types = Object.values(load);
  if (!types.length) return 'empty';
  return types.map((t) => CONTAINER_SPECS[t!].label).join(' + ');
}

export function TruckPanel() {
  const { presetId, message } = store.use();
  return (
    <div className="view-panel card">
      <div className="panel-title">Trailer load</div>
      <div className="segmented">
        {PRESETS.map((p) => (
          <button key={p.id} className={p.id === presetId ? 'active' : ''} onClick={() => choose(p)}>
            {p.label}
          </button>
        ))}
      </div>
      <button className="link-button" onClick={() => choose(INVALID)}>
        Try an impossible load ({INVALID.label})
      </button>
      {message && (
        <div className="notice" role="alert">
          <strong>Load refused.</strong> {message}
          <button aria-label="Dismiss" onClick={() => store.set({ message: null })}>×</button>
        </div>
      )}
    </div>
  );
}
