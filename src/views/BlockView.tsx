import { useState } from 'react';
import { CONTAINER_SPECS, CONTAINER_TYPES, type ContainerType } from '../models/container';
import {
  Block, blockLength, blockWidth, createBlock, demoFill, formatAddress, place, validBays,
  type BlockConfig, type BlockState,
} from '../models/yard';
import { createStore } from '../lib/store';

/** The block size every view starts from. Change it here, or with the steppers in the panel. */
export const DEFAULT_BLOCK: BlockConfig = { bays: 10, rows: 6, tiers: 5 };

const store = createStore<{ block: BlockState; message: { ok: boolean; text: string } | null }>({
  block: demoFill(DEFAULT_BLOCK),
  message: null,
});

export function BlockView() {
  const { block } = store.use();
  return <Block state={block} name="Block A" position={[-blockLength(block.config) / 2, 0, -blockWidth(block.config) / 2]} />;
}

const LIMITS: Record<keyof BlockConfig, [number, number]> = { bays: [2, 24], rows: [1, 10], tiers: [1, 7] };

function Stepper({ label, k }: { label: string; k: keyof BlockConfig }) {
  const { block } = store.use();
  const v = block.config[k];
  const [lo, hi] = LIMITS[k];
  const set = (n: number) => {
    const config = { ...block.config, [k]: n };
    store.set({ block: demoFill(config), message: null });
  };
  return (
    <label className="stepper">
      <span>{label}</span>
      <button disabled={v <= lo} onClick={() => set(v - 1)} aria-label={`Fewer ${label}`}>−</button>
      <output>{v}</output>
      <button disabled={v >= hi} onClick={() => set(v + 1)} aria-label={`More ${label}`}>+</button>
    </label>
  );
}

export function BlockPanel() {
  const { block, message } = store.use();
  const [type, setType] = useState<ContainerType>('20GP');
  const [bay, setBay] = useState(1);
  const [row, setRow] = useState(1);
  const [tier, setTier] = useState(1);
  const count = Object.keys(block.containers).length;

  const submit = () => {
    const at = { bay, row, tier };
    const r = place(block, { type, ...at, color: Math.floor(Math.random() * 8) });
    if (r.ok) store.set({ block: r.value, message: { ok: true, text: `Placed a ${CONTAINER_SPECS[type].label} at ${formatAddress(at)}.` } });
    else store.set({ message: { ok: false, text: r.reason } });
  };

  return (
    <div className="view-panel card">
      <div className="panel-title">
        Block A <span className="muted">· {count} {count === 1 ? 'container' : 'containers'}</span>
      </div>
      <div className="row-wrap">
        <Stepper label="Bays" k="bays" />
        <Stepper label="Rows" k="rows" />
        <Stepper label="Tiers" k="tiers" />
      </div>
      <div className="row-wrap">
        <button className="chip" onClick={() => store.set({ block: demoFill(block.config, Math.floor(Math.random() * 1e6)), message: null })}>
          Demo fill
        </button>
        <button className="chip" onClick={() => store.set({ block: createBlock(block.config), message: null })}>Empty block</button>
      </div>
      <div className="panel-subtitle">Place a container (bay-row-tier)</div>
      <div className="row-wrap">
        <select value={type} onChange={(e) => setType(e.target.value as ContainerType)} aria-label="Container type">
          {CONTAINER_TYPES.map((t) => (
            <option key={t} value={t}>{CONTAINER_SPECS[t].label}</option>
          ))}
        </select>
        <input type="number" value={bay} min={1} onChange={(e) => setBay(+e.target.value)} aria-label="Bay" title="Bay" />
        <input type="number" value={row} min={1} onChange={(e) => setRow(+e.target.value)} aria-label="Row" title="Row" />
        <input type="number" value={tier} min={1} onChange={(e) => setTier(+e.target.value)} aria-label="Tier" title="Tier" />
        <button className="chip primary" onClick={submit}>Place</button>
      </div>
      <div className="hint">
        {CONTAINER_SPECS[type].nominalFeet === 20 ? '20ft bays: ' : '40ft bays: '}
        {validBays(block.config, type).map((b) => String(b).padStart(2, '0')).join(', ')}
      </div>
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
