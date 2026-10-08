import { CONTAINER_SPECS, type ContainerType } from '../models/container';
import {
  BLOCK_MARGIN, ROW_PITCH, canPlace as canPlaceInBlock, formatAddress, occupantAt, place as placeInBlock,
  remove as removeFromBlock, slotPosition, validBays, containersOnTop, type BlockState,
} from '../models/yard';
import { SLOTS, canPlace as canPlaceOnTrailer, placements, type SlotId, type TrailerLoad } from '../models/truck/loads';
import { TRAILER, TRACTOR } from '../models/truck/spec';

/**
 * Everything the crane can touch, in the yard frame (bays along +X, rows along +Z, ground at y = 0):
 * one block, and trucks parked in the lane facing +X.
 */
export interface CarriedContainer {
  id: string;
  type: ContainerType;
  color?: string | number;
}

export interface ParkedTruck {
  id: string;
  /** Kingpin position on the ground; the truck faces +X. */
  x: number;
  z: number;
  load: TrailerLoad;
  ids: Partial<Record<SlotId, string>>;
  colors: Partial<Record<SlotId, string | number>>;
}

export interface World {
  block: BlockState;
  trucks: ParkedTruck[];
}

export type Result<T> = { ok: true; value: T } | { ok: false; reason: string };
const fail = (reason: string): Result<never> => ({ ok: false, reason });

/** Axis-aligned footprint on the ground: centre and half sizes. */
export interface Footprint { x: number; z: number; hx: number; hz: number }
const overlaps = (a: Footprint, b: Footprint) => Math.abs(a.x - b.x) < a.hx + b.hx - 1e-6 && Math.abs(a.z - b.z) < a.hz + b.hz - 1e-6;

/** Something standing on the ground: its footprint and the height of its top. */
interface Solid extends Footprint { top: number; kind: 'container' | 'trailer' | 'cab'; owner?: string }

const containerFootprint = (type: ContainerType, x: number, z: number): Footprint => ({
  x, z, hx: CONTAINER_SPECS[type].length / 2, hz: CONTAINER_SPECS[type].width / 2,
});

/** Every solid in the world, for clearance checks. */
export function solids(world: World): Solid[] {
  const out: Solid[] = [];
  for (const c of Object.values(world.block.containers)) {
    const [x, y, z] = slotPosition(world.block, c.type, c);
    out.push({ ...containerFootprint(c.type, x, z), top: y + CONTAINER_SPECS[c.type].height, kind: 'container', owner: c.id });
  }
  for (const t of world.trucks) {
    const len = TRAILER.frontX - TRAILER.rearX;
    out.push({ x: t.x + (TRAILER.frontX + TRAILER.rearX) / 2, z: t.z, hx: len / 2, hz: TRAILER.width / 2, top: TRAILER.deckY, kind: 'trailer', owner: t.id });
    const cab = TRACTOR.cab;
    out.push({ x: t.x + (cab.backX + cab.frontX) / 2, z: t.z, hx: (cab.frontX - cab.backX) / 2 + 0.1, hz: TRACTOR.width / 2, top: cab.topY + 0.25, kind: 'cab', owner: t.id });
    for (const p of placements(t.load)) {
      out.push({ ...containerFootprint(p.type, t.x + p.x, t.z), top: TRAILER.deckY + CONTAINER_SPECS[p.type].height, kind: 'container', owner: t.ids[p.slot] });
    }
  }
  return out;
}

/** Height of the highest surface under a footprint (0 = bare ground). */
export function floorUnder(world: World, f: Footprint): number {
  let h = 0;
  for (const s of solids(world)) if (overlaps(f, s)) h = Math.max(h, s.top);
  return h;
}

const ALIGN = 0.12; // metres a spreader may be off centre and still lock / set down
const TOUCH = 0.03; // metres between surfaces that count as resting on each other

/** A container whose top the spreader (of `length`, underside at `y`) is sitting squarely on. */
export function containerUnder(world: World, x: number, z: number, y: number):
  | { where: 'block'; id: string; type: ContainerType; color?: string | number }
  | { where: 'truck'; truck: ParkedTruck; slot: SlotId; type: ContainerType; id: string; color?: string | number }
  | null {
  for (const c of Object.values(world.block.containers)) {
    const [cx, cy, cz] = slotPosition(world.block, c.type, c);
    if (Math.abs(cx - x) < ALIGN && Math.abs(cz - z) < ALIGN && Math.abs(cy + CONTAINER_SPECS[c.type].height - y) < TOUCH) {
      return { where: 'block', id: c.id, type: c.type, color: c.color };
    }
  }
  for (const t of world.trucks) {
    for (const p of placements(t.load)) {
      const top = TRAILER.deckY + CONTAINER_SPECS[p.type].height;
      if (Math.abs(t.x + p.x - x) < ALIGN && Math.abs(t.z - z) < ALIGN && Math.abs(top - y) < TOUCH) {
        return { where: 'truck', truck: t, slot: p.slot, type: p.type, id: t.ids[p.slot] ?? `${t.id}-${p.slot}`, color: t.colors[p.slot] };
      }
    }
  }
  return null;
}

/** Takes the container under the spreader out of the world, ready to be carried. */
export function pickUp(world: World, x: number, z: number, y: number, spreaderFeet: 20 | 40): Result<{ world: World; container: CarriedContainer }> {
  const hit = containerUnder(world, x, z, y);
  if (!hit) return fail('The spreader is not sitting squarely on top of a container.');
  if (CONTAINER_SPECS[hit.type].nominalFeet !== spreaderFeet) {
    return fail(`The spreader is set to ${spreaderFeet}ft but this container is ${CONTAINER_SPECS[hit.type].nominalFeet}ft.`);
  }
  const container: CarriedContainer = { id: hit.id, type: hit.type, color: hit.color };
  if (hit.where === 'block') {
    const r = removeFromBlock(world.block, hit.id);
    if (!r.ok) return r;
    return { ok: true, value: { world: { ...world, block: r.value }, container } };
  }
  const trucks = world.trucks.map((t) => {
    if (t !== hit.truck) return t;
    const load = { ...t.load };
    const ids = { ...t.ids };
    delete load[hit.slot];
    delete ids[hit.slot];
    return { ...t, load, ids };
  });
  return { ok: true, value: { world: { ...world, trucks }, container } };
}

/** Sets a carried container down where it hangs, if that is a proper slot in the block or on a trailer. */
export function setDown(world: World, c: CarriedContainer, x: number, z: number, bottomY: number): Result<World> {
  const spec = CONTAINER_SPECS[c.type];
  const floor = floorUnder(world, containerFootprint(c.type, x, z));
  if (bottomY - floor > TOUCH) return fail('The container is still in the air — lower it until it rests on something.');

  // On a trailer?
  for (const t of world.trucks) {
    const slots = (Object.keys(SLOTS) as SlotId[]).filter((s) => SLOTS[s].feet === spec.nominalFeet);
    const slot = slots.find((s) => Math.abs(t.x + SLOTS[s].centreX - x) < ALIGN && Math.abs(t.z - z) < ALIGN);
    if (!slot) continue;
    if (Math.abs(bottomY - TRAILER.deckY) > TOUCH) return fail('The container is not resting on the trailer deck.');
    const ok = canPlaceOnTrailer(t.load, slot, c.type);
    if (!ok.ok) return ok;
    const trucks = world.trucks.map((u) =>
      u === t ? { ...u, load: { ...u.load, [slot]: c.type }, ids: { ...u.ids, [slot]: c.id }, colors: { ...u.colors, [slot]: c.color ?? 0 } } : u,
    );
    return { ok: true, value: { ...world, trucks } };
  }

  // In the block?
  const { block } = world;
  const bay = validBays(block.config, c.type).find((b) => Math.abs(slotPosition(block, c.type, { bay: b, row: 1, tier: 1 })[0] - x) < ALIGN);
  const rowF = (z - BLOCK_MARGIN) / ROW_PITCH + 0.5;
  const row = Math.round(rowF);
  if (bay === undefined || Math.abs(BLOCK_MARGIN + (row - 0.5) * ROW_PITCH - z) > ALIGN || row < 1 || row > block.config.rows) {
    return fail('Containers can only be set down squarely in a block slot or on a trailer position.');
  }
  for (let tier = 1; tier <= block.config.tiers + 1; tier++) {
    const at = { bay, row, tier };
    const check = canPlaceInBlock(block, c.type, at);
    if (!check.ok && /already taken/.test(check.reason)) continue;
    if (!check.ok) return check;
    if (Math.abs(slotPosition(block, c.type, at)[1] - bottomY) > TOUCH) {
      return fail(`The container is not resting on the stack at ${formatAddress(at)}.`);
    }
    const r = placeInBlock(block, { id: c.id, type: c.type, color: c.color, ...at });
    if (!r.ok) return r;
    return { ok: true, value: { ...world, block: r.value } };
  }
  return fail('That stack is full.');
}

export { occupantAt, containersOnTop };
