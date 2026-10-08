import { CONTAINER_SPECS, TWENTY_PAIR_GAP, fittingCentres, type ContainerType } from '../container';
import { deckCentreX } from './spec';

/**
 * Container positions on a 40ft combination skeletal trailer.
 *  - full40:   one 40ft (standard or High Cube) over the whole deck
 *  - front20 / rear20: two 20ft end to end, the standard 76 mm apart
 *  - centre20: one 20ft on its own, in the middle so both axle groups share the weight
 */
export type SlotId = 'full40' | 'front20' | 'rear20' | 'centre20';
export type TrailerLoad = Partial<Record<SlotId, ContainerType>>;

const PAIR_OFFSET = (CONTAINER_SPECS['20GP'].length + TWENTY_PAIR_GAP) / 2;

export const SLOTS: Record<SlotId, { feet: 20 | 40; centreX: number; label: string }> = {
  full40: { feet: 40, centreX: deckCentreX(), label: '40ft position' },
  front20: { feet: 20, centreX: deckCentreX() + PAIR_OFFSET, label: 'front 20ft position' },
  rear20: { feet: 20, centreX: deckCentreX() - PAIR_OFFSET, label: 'rear 20ft position' },
  centre20: { feet: 20, centreX: deckCentreX(), label: 'centre 20ft position' },
};

/** Slots that cannot be used at the same time because the containers would overlap. */
const CONFLICTS: Record<SlotId, SlotId[]> = {
  full40: ['front20', 'rear20', 'centre20'],
  front20: ['full40', 'centre20'],
  rear20: ['full40', 'centre20'],
  centre20: ['full40', 'front20', 'rear20'],
};

export type LoadResult = { ok: true } | { ok: false; reason: string };

/** Checks whether one more container can go into a slot, given what is already on the trailer. */
export function canPlace(load: TrailerLoad, slot: SlotId, type: ContainerType): LoadResult {
  const spec = CONTAINER_SPECS[type];
  const s = SLOTS[slot];
  if (spec.nominalFeet !== s.feet) {
    return { ok: false, reason: `A ${spec.label} container does not fit the ${s.label}.` };
  }
  if (load[slot]) return { ok: false, reason: `The ${s.label} is already taken.` };
  const blocker = CONFLICTS[slot].find((other) => load[other]);
  if (blocker) {
    return { ok: false, reason: `The ${s.label} overlaps the container already in the ${SLOTS[blocker].label}.` };
  }
  return { ok: true };
}

export type PlanResult = { ok: true; load: TrailerLoad } | { ok: false; reason: string };

/** Picks the positions for a whole set of containers, the way a terminal would load them. */
export function planLoad(types: ContainerType[]): PlanResult {
  const twenties = types.filter((t) => CONTAINER_SPECS[t].nominalFeet === 20);
  const forties = types.filter((t) => CONTAINER_SPECS[t].nominalFeet === 40);
  if (types.length === 0) return { ok: true, load: {} };
  if (forties.length === 1 && twenties.length === 0) return { ok: true, load: { full40: forties[0] } };
  if (forties.length === 0 && twenties.length === 1) return { ok: true, load: { centre20: twenties[0] } };
  if (forties.length === 0 && twenties.length === 2) {
    return { ok: true, load: { front20: twenties[0], rear20: twenties[1] } };
  }
  const describe = [
    forties.length ? `${forties.length} × 40ft` : '',
    twenties.length ? `${twenties.length} × 20ft` : '',
  ]
    .filter(Boolean)
    .join(' + ');
  return {
    ok: false,
    reason: `A 40ft trailer carries one 40ft, one 20ft or two 20ft containers — not ${describe}.`,
  };
}

/** Where each container sits in the trailer frame (x of its floor centre). */
export function placements(load: TrailerLoad): { slot: SlotId; type: ContainerType; x: number }[] {
  return (Object.keys(load) as SlotId[])
    .filter((slot) => load[slot])
    .map((slot) => ({ slot, type: load[slot]!, x: SLOTS[slot].centreX }));
}

/**
 * Twistlock positions on the trailer frame (x, z). One set of locks serves every slot:
 * the 40ft outer locks double as the outer locks of a 20ft pair (they differ by about 1 mm).
 */
export function twistlockPositions(): [number, number][] {
  const xs = new Set<number>();
  const round = (v: number) => Math.round(v * 1000) / 1000;
  for (const [x] of fittingCentres('40GP')) xs.add(round(SLOTS.full40.centreX + x));
  for (const slot of ['front20', 'rear20', 'centre20'] as SlotId[]) {
    for (const [x] of fittingCentres('20GP')) {
      const v = round(SLOTS[slot].centreX + x);
      if (![...xs].some((e) => Math.abs(e - v) < 0.005)) xs.add(v);
    }
  }
  const hz = CONTAINER_SPECS['40GP'].fittingSpanWidth / 2;
  return [...xs].sort((a, b) => b - a).flatMap((x) => [[x, -hz], [x, hz]] as [number, number][]);
}
