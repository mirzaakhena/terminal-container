/**
 * ISO 668 external dimensions and ISO 1161 corner-fitting positions, in metres.
 * Local frame used by every container model: length along X (doors at +X),
 * width along Z, origin at the centre of the floor (bottom face at y = 0).
 */
export type ContainerType = '20GP' | '40GP' | '40HC';

export interface ContainerSpec {
  type: ContainerType;
  label: string;
  /** Nominal length in feet: 20 or 40. Used for spreader and trailer slot matching. */
  nominalFeet: 20 | 40;
  length: number;
  width: number;
  height: number;
  /** Distance between centres of the corner-fitting apertures, along the length and across the width. */
  fittingSpanLength: number;
  fittingSpanWidth: number;
}

export const CONTAINER_WIDTH = 2.438;
export const STANDARD_HEIGHT = 2.591; // 8'6"
export const HIGH_CUBE_HEIGHT = 2.896; // 9'6"
/** Standard gap between two 20ft containers that together occupy one 40ft slot (ISO 668: 3 in). */
export const TWENTY_PAIR_GAP = 0.076;
const FITTING_SPAN_WIDTH = 2.259;

export const CONTAINER_SPECS: Record<ContainerType, ContainerSpec> = {
  '20GP': {
    type: '20GP',
    label: "20ft standard",
    nominalFeet: 20,
    length: 6.058,
    width: CONTAINER_WIDTH,
    height: STANDARD_HEIGHT,
    fittingSpanLength: 5.853,
    fittingSpanWidth: FITTING_SPAN_WIDTH,
  },
  '40GP': {
    type: '40GP',
    label: "40ft standard",
    nominalFeet: 40,
    length: 12.192,
    width: CONTAINER_WIDTH,
    height: STANDARD_HEIGHT,
    fittingSpanLength: 11.985,
    fittingSpanWidth: FITTING_SPAN_WIDTH,
  },
  '40HC': {
    type: '40HC',
    label: "40ft High Cube",
    nominalFeet: 40,
    length: 12.192,
    width: CONTAINER_WIDTH,
    height: HIGH_CUBE_HEIGHT,
    fittingSpanLength: 11.985,
    fittingSpanWidth: FITTING_SPAN_WIDTH,
  },
};

export const CONTAINER_TYPES = Object.keys(CONTAINER_SPECS) as ContainerType[];

/** Corner-fitting size (ISO 1161), used for the visible castings. */
export const CASTING = { length: 0.178, height: 0.118, width: 0.162 } as const;

/** Centres of the four bottom (or top) corner-fitting apertures in the container's local frame, x/z only. */
export function fittingCentres(type: ContainerType): [number, number][] {
  const s = CONTAINER_SPECS[type];
  const hx = s.fittingSpanLength / 2;
  const hz = s.fittingSpanWidth / 2;
  return [
    [-hx, -hz],
    [-hx, hz],
    [hx, -hz],
    [hx, hz],
  ];
}

export const describeSize = (type: ContainerType): string => {
  const s = CONTAINER_SPECS[type];
  return `${s.length.toFixed(2)} × ${s.width.toFixed(2)} × ${s.height.toFixed(2)} m`;
};
