/**
 * Truck dimensions in metres. Both halves use +X as "forward".
 *  - Tractor frame: origin on the ground directly below the fifth-wheel centre.
 *  - Trailer frame: origin on the ground directly below the kingpin.
 * When coupled the two origins coincide, and the trailer pivots about the vertical axis through them.
 */
export const WHEEL = { radius: 0.52, width: 0.3, hubRadius: 0.3 } as const;

export const TRACTOR = {
  width: 2.45,
  frontAxleX: 3.6,
  rearAxlesX: [0.375, -0.975],
  rearEndX: -1.4,
  frontEndX: 4.9,
  cab: { backX: 2.65, frontX: 4.85, bottomY: 1.1, topY: 3.3 },
  frameY: [0.85, 1.1] as const,
  frameZ: 0.45,
  /** Height of the fifth-wheel plate's top face, where the trailer rests. */
  fifthWheelTopY: 1.25,
  fifthWheelRadius: 0.45,
} as const;

export const TRAILER = {
  width: 2.44,
  /** Front edge sits this far ahead of the kingpin, over the tractor. */
  frontX: 1.15,
  rearX: -11.25,
  /** Underside of the front plate that rests on the fifth wheel. */
  plateY: TRACTOR.fifthWheelTopY,
  /** Top of the cross beams: the floor of any container on the trailer. */
  deckY: 1.45,
  /** Where the deep part of the main rails starts. */
  neckX: -1.8,
  railBottomY: 1.0,
  railZ: 0.5,
  axlesX: [-8.09, -9.4, -10.71],
  landingLegX: -2.4,
  landingLegZ: 0.85,
  kingpin: { radius: 0.045, length: 0.08 },
  /** Front face of a 40ft load, set just behind the front beam. */
  loadFrontX: 1.05,
} as const;

export const deckCentreX = (): number => TRAILER.loadFrontX - 12.192 / 2;
