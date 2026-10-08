import { CONTAINER_SPECS, CONTAINER_WIDTH, type ContainerType } from '../container';

/**
 * A storage block: `bays` slots along its length (each one 20ft container long), `rows` side by side
 * across it, and stacks up to `tiers` high.
 *
 * Addresses follow the usual terminal convention:
 *  - bay numbers: 20ft bays are odd (01, 03, 05 …); a 40ft container covers two of them and takes
 *    the even number between (01 + 03 → 02, 05 + 07 → 06)
 *  - rows count from 1 on the truck-lane side; tiers count from 1 at the ground
 *
 * Block frame: origin at the block's corner on the ground, bays along +X, rows along +Z.
 */
export interface BlockConfig {
  bays: number;
  rows: number;
  tiers: number;
}

/** Ground space per 20ft bay and per row, gaps included. Two bays fit a 40ft with room to spare. */
export const BAY_PITCH = 6.5;
export const ROW_PITCH = CONTAINER_WIDTH + 0.4;
/** Painted margin between the slots and the block outline. */
export const BLOCK_MARGIN = 0.6;

export const blockLength = (c: BlockConfig) => c.bays * BAY_PITCH + 2 * BLOCK_MARGIN;
export const blockWidth = (c: BlockConfig) => c.rows * ROW_PITCH + 2 * BLOCK_MARGIN;

export interface BlockContainer {
  id: string;
  type: ContainerType;
  /** Bay number as operators say it: odd for 20ft, even (4k + 2) for 40ft. */
  bay: number;
  row: number;
  tier: number;
  color?: string | number;
}

export interface BlockState {
  config: BlockConfig;
  containers: Record<string, BlockContainer>;
}

export type Result<T = void> = { ok: true; value: T } | { ok: false; reason: string };
const ok = <T>(value: T): Result<T> => ({ ok: true, value });
const fail = (reason: string): Result<never> => ({ ok: false, reason });

export const createBlock = (config: BlockConfig): BlockState => ({ config, containers: {} });

const pad = (n: number) => String(n).padStart(2, '0');
export const formatAddress = (a: { bay: number; row: number; tier: number }) => `${pad(a.bay)}-${pad(a.row)}-${a.tier}`;

/** The 0-based 20ft bay indices a container at this bay number covers, or an error. */
export function bayIndices(config: BlockConfig, type: ContainerType, bay: number): Result<number[]> {
  const feet = CONTAINER_SPECS[type].nominalFeet;
  if (feet === 20) {
    if (bay % 2 !== 1) return fail(`20ft containers use odd bay numbers (01, 03 …), not ${pad(bay)}.`);
    const i = (bay - 1) / 2;
    if (i < 0 || i >= config.bays) return fail(`Bay ${pad(bay)} is outside this block (bays 01–${pad(config.bays * 2 - 1)}).`);
    return ok([i]);
  }
  if (bay % 4 !== 2) return fail(`40ft containers use bay numbers 02, 06, 10 …, not ${pad(bay)}.`);
  const i = (bay - 2) / 2;
  if (i < 0 || i + 1 >= config.bays) return fail(`Bay ${pad(bay)} is outside this block.`);
  return ok([i, i + 1]);
}

/** Bay numbers that may be used for a container type in this block. */
export function validBays(config: BlockConfig, type: ContainerType): number[] {
  const out: number[] = [];
  for (let b = 1; b <= config.bays * 2; b++) if (bayIndices(config, type, b).ok) out.push(b);
  return out;
}

/** The container occupying a ground cell (20ft bay index, row) at a tier, if any. */
export function occupantAt(state: BlockState, bayIndex: number, row: number, tier: number): BlockContainer | undefined {
  return Object.values(state.containers).find((c) => {
    if (c.row !== row || c.tier !== tier) return false;
    const r = bayIndices(state.config, c.type, c.bay);
    return r.ok && r.value.includes(bayIndex);
  });
}

/** Checks whether a container may be put down at an address. */
export function canPlace(state: BlockState, type: ContainerType, at: { bay: number; row: number; tier: number }): Result {
  const { config } = state;
  const where = formatAddress(at);
  const bays = bayIndices(config, type, at.bay);
  if (!bays.ok) return bays;
  if (at.row < 1 || at.row > config.rows) return fail(`Row ${pad(at.row)} is outside this block (rows 01–${pad(config.rows)}).`);
  if (at.tier < 1) return fail(`Tier ${at.tier} does not exist.`);
  if (at.tier > config.tiers) return fail(`Tier ${at.tier} is above this block's limit of ${config.tiers} high.`);

  for (const i of bays.value) {
    const here = occupantAt(state, i, at.row, at.tier);
    if (here) return fail(`${where} is already taken by ${here.id}.`);
  }
  if (at.tier === 1) return ok(undefined);

  const below = bays.value.map((i) => occupantAt(state, i, at.row, at.tier - 1));
  if (below.some((b) => !b)) return fail(`${where} would be in mid-air: nothing is stacked below it.`);
  const feet = CONTAINER_SPECS[type].nominalFeet;
  const belowFeet = CONTAINER_SPECS[below[0]!.type].nominalFeet;
  if (feet === 20 && belowFeet === 40) return fail(`A 20ft container cannot stand on a 40ft one (${below[0]!.id}).`);
  if (feet === 40 && below.some((b) => CONTAINER_SPECS[b!.type].nominalFeet === 20)) {
    return fail('A 40ft container cannot stand on 20ft containers.');
  }
  return ok(undefined);
}

let seq = 0;
const nextId = () => `TCKU${String(1000000 + ++seq).slice(1)}`;

/** Returns a new state with the container added, or the reason it was refused. */
export function place(
  state: BlockState,
  c: Omit<BlockContainer, 'id'> & { id?: string },
): Result<BlockState> {
  const check = canPlace(state, c.type, c);
  if (!check.ok) return check;
  const id = c.id ?? nextId();
  if (state.containers[id]) return fail(`A container called ${id} is already in this block.`);
  return ok({ ...state, containers: { ...state.containers, [id]: { ...c, id } } });
}

/** Containers sitting directly on top of this one. */
export function containersOnTop(state: BlockState, id: string): BlockContainer[] {
  const c = state.containers[id];
  if (!c) return [];
  const r = bayIndices(state.config, c.type, c.bay);
  if (!r.ok) return [];
  const above = r.value.map((i) => occupantAt(state, i, c.row, c.tier + 1)).filter(Boolean) as BlockContainer[];
  return [...new Map(above.map((a) => [a.id, a])).values()];
}

/** Returns a new state without the container, refused while anything is stacked on it. */
export function remove(state: BlockState, id: string): Result<BlockState> {
  if (!state.containers[id]) return fail(`${id} is not in this block.`);
  const top = containersOnTop(state, id);
  if (top.length) return fail(`${id} is buried under ${top.map((t) => t.id).join(', ')}.`);
  const { [id]: _removed, ...rest } = state.containers;
  return ok({ ...state, containers: rest });
}

/** Centre of the slot's floor in the block frame: x along bays, z across rows, y = top of the stack below. */
export function slotPosition(state: BlockState, type: ContainerType, at: { bay: number; row: number; tier: number }): [number, number, number] {
  const r = bayIndices(state.config, type, at.bay);
  if (!r.ok) throw new Error(r.reason);
  const x = BLOCK_MARGIN + ((r.value[0] + r.value[r.value.length - 1]) / 2 + 0.5) * BAY_PITCH;
  const z = BLOCK_MARGIN + (at.row - 0.5) * ROW_PITCH;
  let y = 0;
  for (let t = 1; t < at.tier; t++) {
    const below = occupantAt(state, r.value[0], at.row, t);
    y += below ? CONTAINER_SPECS[below.type].height : CONTAINER_SPECS[type].height;
  }
  return [x, y, z];
}

/** Total stack height (metres) under a ground cell, used for crane clearance. */
export function stackHeight(state: BlockState, bayIndex: number, row: number): number {
  let h = 0;
  for (let t = 1; t <= state.config.tiers; t++) {
    const c = occupantAt(state, bayIndex, row, t);
    if (!c) break;
    h += CONTAINER_SPECS[c.type].height;
  }
  return h;
}

/** A believable, partly filled block with mixed sizes. Deterministic for a given seed. */
export function demoFill(config: BlockConfig, seed = 7, fill = 0.55): BlockState {
  let s = seed;
  const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  let state = createBlock(config);
  // Some bay pairs hold 40ft stacks, the rest 20ft — as yards usually separate them.
  const fortyPairs = new Set<number>();
  for (let i = 0; i + 1 < config.bays; i += 2) if (rand() < 0.45) fortyPairs.add(i);

  for (let row = 1; row <= config.rows; row++) {
    for (let i = 0; i < config.bays; i++) {
      const pairStart = i % 2 === 0 ? i : i - 1;
      const forty = fortyPairs.has(pairStart);
      if (forty && i !== pairStart) continue;
      const height = Math.floor(rand() * (config.tiers + 1) * fill * 1.6);
      for (let tier = 1; tier <= Math.min(height, config.tiers); tier++) {
        const type: ContainerType = forty ? (rand() < 0.5 ? '40HC' : '40GP') : '20GP';
        const bay = forty ? i * 2 + 2 : i * 2 + 1;
        const r = place(state, { type, bay, row, tier, color: Math.floor(rand() * 8) });
        if (r.ok) state = r.value;
      }
    }
  }
  return state;
}
