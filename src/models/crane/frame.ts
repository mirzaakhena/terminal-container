import { CONTAINER_SPECS } from '../container';
import { SPREADER, type CraneSpec } from './spec';

/**
 * The crane's rigid parts as boxes, shared by the renderer and the clearance tests so the
 * drawing and the checks can never disagree.
 *  - frame parts are in the gantry frame: x along the block relative to the gantry position, y up, z in yard z
 *  - trolley parts are relative to the trolley: x as above, y up, z relative to the trolley position
 */
export type Box = { from: [number, number, number]; to: [number, number, number]; material: PartMaterial; name: string };
export type PartMaterial = 'white' | 'brand' | 'frame' | 'amber' | 'steelDark' | 'glass';

export const FRAME = {
  leg: 0.9,
  girderH: 1.3,
  sillY: 0.75,
  wheelR: 0.62,
  girderX: 1.9,
  girderW: 0.7,
  trolley: { x: 4.6, z: 3.4, h: 1.5 },
  ropeDx: 0.9,
  ropeDz: 0.8,
} as const;

/**
 * Operator cab: hangs between the girders on the lane side of the trolley, beside the spreader
 * rather than above it, so the spreader and any load can rise to the top limit without touching it.
 */
export const CAB = {
  x: [-0.9, 0.9] as [number, number],
  /** Below the girder underside. */
  depth: 2.2,
  z: [-3.5, -1.65] as [number, number],
};

export function frameParts(spec: CraneSpec): Box[] {
  const { leg, girderH, sillY, girderX, girderW } = FRAME;
  const [z0, z1] = spec.legZ;
  const top = spec.girderY;
  const hw = spec.wheelbase / 2;
  const out: Box[] = [];
  for (const z of [z0, z1]) {
    out.push({ name: 'sill', from: [-hw - 1.2, sillY, z - 0.55], to: [hw + 1.2, sillY + 0.9, z + 0.55], material: 'white' });
    for (const x of [-hw, hw]) {
      out.push({ name: 'leg', from: [x - leg / 2, sillY + 0.9, z - leg / 2], to: [x + leg / 2, top + girderH, z + leg / 2], material: 'white' });
      out.push({ name: 'leg stripe', from: [x - leg / 2 - 0.01, sillY + 0.9, z - leg / 2 - 0.01], to: [x + leg / 2 + 0.01, sillY + 1.5, z + leg / 2 + 0.01], material: 'amber' });
      out.push({ name: 'bogie', from: [x - 1.3, FRAME.wheelR + 0.1, z - 0.4], to: [x + 1.3, sillY + 0.05, z + 0.4], material: 'frame' });
    }
    out.push({ name: 'portal beam', from: [-hw - 0.6, top, z - 0.6], to: [hw + 0.6, top + girderH, z + 0.6], material: 'brand' });
    out.push({ name: 'leg tie', from: [-hw, top * 0.45, z - 0.3], to: [hw, top * 0.45 + 0.5, z + 0.3], material: 'white' });
  }
  for (const x of [-girderX, girderX]) {
    out.push({ name: 'girder', from: [x - girderW / 2, top, z0 - 0.6], to: [x + girderW / 2, top + girderH, z1 + 0.6], material: 'brand' });
    out.push({ name: 'rail', from: [x - 0.08, top + girderH, z0 - 0.4], to: [x + 0.08, top + girderH + 0.08, z1 + 0.4], material: 'steelDark' });
  }
  out.push({ name: 'power house', from: [-2.2, sillY + 0.9, z1 - 0.5], to: [1.8, sillY + 3.0, z1 + 0.55], material: 'white' });
  out.push({ name: 'power house grille', from: [-2.0, sillY + 1.4, z1 + 0.55], to: [1.6, sillY + 2.6, z1 + 0.57], material: 'steelDark' });
  return out;
}

export function trolleyParts(spec: CraneSpec): Box[] {
  const { girderH, trolley } = FRAME;
  const top = spec.girderY;
  const base = top + girderH + 0.08;
  const [cx0, cx1] = CAB.x;
  const [cz0, cz1] = CAB.z;
  const cy0 = top - CAB.depth;
  return [
    { name: 'trolley', from: [-trolley.x / 2, base, -trolley.z / 2], to: [trolley.x / 2, base + trolley.h, trolley.z / 2], material: 'white' },
    { name: 'trolley stripe', from: [-trolley.x / 2 - 0.01, base + 0.42, -trolley.z / 2 - 0.01], to: [trolley.x / 2 + 0.01, base + 0.67, trolley.z / 2 + 0.01], material: 'brand' },
    { name: 'cab hanger', from: [-0.15, top - 0.2, cz0 + 0.6], to: [0.15, base, cz0 + 0.9], material: 'frame' },
    { name: 'cab', from: [cx0, cy0, cz0], to: [cx1, top - 0.05, cz1], material: 'white' },
    { name: 'cab front window', from: [cx0 + 0.15, cy0 + 0.3, cz0 - 0.01], to: [cx1 - 0.15, top - 0.5, cz0 + 0.01], material: 'glass' },
    { name: 'cab floor window', from: [cx0 + 0.2, cy0 - 0.01, cz0 + 0.2], to: [cx1 - 0.2, cy0 + 0.01, cz1 - 0.3], material: 'glass' },
  ];
}

/** Everything that hangs and moves with the hoist, as boxes relative to the trolley, at a given hoist height. */
export function hangingParts(hoistY: number, spreaderLength: number, carried?: keyof typeof CONTAINER_SPECS): Box[] {
  const half = spreaderLength / 2;
  const w = SPREADER.width / 2;
  const out: Box[] = [
    { name: 'spreader', from: [-half - 0.18, hoistY - 0.06, -w], to: [half + 0.18, hoistY + SPREADER.height, w], material: 'amber' },
    { name: 'headblock', from: [-1.3, hoistY + SPREADER.height, -1.1], to: [1.3, hoistY + SPREADER.height + SPREADER.headblock, 1.1], material: 'amber' },
  ];
  if (carried) {
    const s = CONTAINER_SPECS[carried];
    out.push({ name: 'load', from: [-s.length / 2, hoistY - s.height, -s.width / 2], to: [s.length / 2, hoistY, s.width / 2], material: 'white' });
  }
  return out;
}

export const boxesOverlap = (a: Box, b: Box) =>
  a.from.every((v, i) => v < b.to[i] - 1e-6) && b.from.every((v, i) => v < a.to[i] - 1e-6);

export const shiftZ = (b: Box, dz: number): Box => ({ ...b, from: [b.from[0], b.from[1], b.from[2] + dz], to: [b.to[0], b.to[1], b.to[2] + dz] });
