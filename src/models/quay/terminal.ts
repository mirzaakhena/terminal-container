import { blockLength, type BlockConfig } from '../yard';
import { craneSpec } from '../crane';
import { frameParts, trolleyParts } from '../crane/frame';
import { CORNER_X, TURN_RADIUS } from '../../sim/jobs';
import { DEFAULT_SHIP_LENGTH, quayLayout, type QuayLayout } from './layout';

/** Clear ground between the yard crane's far side and the start of the quay paving. */
export const YARD_TO_QUAY_GAP = 6;

/** The x range the yard crane can ever cover, over its whole gantry travel, wheels and sills included. */
export function yardCraneXRange(block: BlockConfig): [number, number] {
  const spec = craneSpec(block);
  const parts = frameParts(spec);
  const lo = Math.min(...parts.map((b) => Math.min(b.from[0], b.to[0])));
  const hi = Math.max(...parts.map((b) => Math.max(b.from[0], b.to[0])));
  return [Math.min(0, spec.gantry.min + lo), Math.max(blockLength(block), spec.gantry.max + hi)];
}

/** How far the yard crane reaches toward the water (yard z), over every part of its frame and trolley. */
export function yardCraneFarZ(block: BlockConfig): number {
  const spec = craneSpec(block);
  const frame = Math.max(...frameParts(spec).map((b) => Math.max(b.from[2], b.to[2])));
  const trolley = spec.trolley.max + Math.max(...trolleyParts(spec).map((b) => Math.max(b.from[2], b.to[2])));
  return Math.max(frame, trolley);
}

/**
 * The quay that goes with a block: along the block's long side, on the side away from the truck lane
 * and gate road, with its berth centred on the block and sized for the ship.
 */
export function yardQuay(block: BlockConfig, shipLength = DEFAULT_SHIP_LENGTH): QuayLayout {
  return quayLayout({
    shipLength,
    centreX: blockLength(block) / 2,
    landZ: yardCraneFarZ(block) + YARD_TO_QUAY_GAP,
    // Clear of the crane, and west of the corner where the road from the gate turns into the block lane.
    keepClear: [Math.min(CORNER_X - TURN_RADIUS, yardCraneXRange(block)[0]), yardCraneXRange(block)[1]],
  });
}
