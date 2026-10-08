import { CONTAINER_SPECS, HIGH_CUBE_HEIGHT } from '../container';
import { BLOCK_MARGIN, ROW_PITCH, blockLength, blockWidth, type BlockConfig } from '../yard';

/**
 * Rubber-tyred gantry crane sized for one block plus one truck lane.
 * Yard frame (same as the block frame): bays along +X, rows along +Z, the truck lane alongside row 1 at z < 0.
 *  - gantry  (X): the whole crane drives along the block
 *  - trolley (Z): runs across the top girders, from the truck lane to the last row
 *  - hoist   (Y): height of the spreader's underside above the ground
 */
export const LANE_WIDTH = 4.5;
/** Centre of the truck lane, beside row 1. */
export const LANE_Z = -(LANE_WIDTH / 2 + 0.4);

export const SPREADER = {
  minLength: CONTAINER_SPECS['20GP'].length,
  maxLength: CONTAINER_SPECS['40GP'].length,
  width: CONTAINER_SPECS['20GP'].width,
  /** Height of the spreader frame itself. */
  height: 0.45,
  /** Headblock above the spreader, where the ropes attach. */
  headblock: 0.7,
  telescopeSpeed: 1.2, // m/s of total length change
} as const;

export const SPEEDS = {
  gantry: { max: 2.2, accel: 0.5 }, // 130 m/min
  trolley: { max: 1.2, accel: 0.6 }, // 70 m/min
  hoistEmpty: { max: 0.87, accel: 0.6 }, // 52 m/min
  hoistLoaded: { max: 0.47, accel: 0.4 }, // 28 m/min
} as const;

export interface CraneSpec {
  /** Distance between the leg centrelines across the block. */
  span: number;
  legZ: [number, number];
  /** Distance between the front and rear legs along the block. */
  wheelbase: number;
  /** Underside of the top girders. */
  girderY: number;
  gantry: { min: number; max: number };
  trolley: { min: number; max: number };
  /** Spreader underside travel: from the ground to high enough to carry a High Cube over a full-height High Cube stack. */
  hoist: { min: number; max: number };
}

export function craneSpec(block: BlockConfig): CraneSpec {
  const W = blockWidth(block);
  const L = blockLength(block);
  const legZ: [number, number] = [LANE_Z - LANE_WIDTH / 2 - 1.3, W + 1.4];
  const hoistMax = block.tiers * HIGH_CUBE_HEIGHT + HIGH_CUBE_HEIGHT + 0.8;
  return {
    span: legZ[1] - legZ[0],
    legZ,
    wheelbase: 6.6,
    girderY: hoistMax + SPREADER.height + SPREADER.headblock + 1.2,
    gantry: { min: -4, max: L + 4 },
    trolley: { min: LANE_Z, max: BLOCK_MARGIN + (block.rows - 0.5) * ROW_PITCH },
    hoist: { min: 0, max: hoistMax },
  };
}
