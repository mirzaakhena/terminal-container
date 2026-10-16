/**
 * The quayside: the paved strip along the water where ships tie up and the quay crane works.
 *
 * Frame: the same as the yard (block) frame. The quay runs along +X; going along +Z from the
 * land you cross, in order:
 *  - the backreach: a strip behind the quay crane's landside legs, kept free for hatch covers
 *  - the landside crane rail
 *  - the apron truck lanes, between the crane's legs
 *  - the waterside crane rail
 *  - the quay edge, with bollards along it; water beyond (z > edgeZ)
 *
 * The berth is sized for the ship: ship length plus BERTH_END_CLEARANCE at each end. The quay is
 * exactly as long as its berth, so it grows and shrinks with the ship.
 */

/** Default ship the berth is sized for: a feeder of about 150 m. */
export const DEFAULT_SHIP_LENGTH = 150;
/** Free quay at each end of the ship, for mooring lines and room to come alongside. */
export const BERTH_END_CLEARANCE = 25;

/** Quay crane rail gauge (distance between the waterside and landside rails), 100 ft as at most terminals. */
export const RAIL_GAUGE = 30.48;
/** Waterside rail centre, measured in from the quay edge. */
export const WATERSIDE_RAIL_SETBACK = 3;
/** Room kept clear of trucks on each side of a crane leg's rail. */
export const LEG_CLEARANCE = 4.5;

export const APRON_LANE_WIDTH = 4.5;
/** Painted gap between neighbouring apron lanes. */
export const APRON_LANE_GAP = 0.6;
export const APRON_LANE_COUNT = 4;

/** Depth of the backreach strip behind the landside rail (hatch covers are set down here later). */
export const BACKREACH_DEPTH = 15;
/** Gap between the landside rail and the start of the backreach, for the crane's sill beams and bogies. */
export const BACKREACH_SETBACK = 2;
/** Paving beyond the backreach, on the land side. */
export const LANDSIDE_MARGIN = 1.5;

/** Bollard spacing along the berth. */
export const BOLLARD_SPACING = 20;
/** Bollard centre, in from the quay edge. */
export const BOLLARD_SETBACK = 0.9;
/** Where a road joins the apron, in from each end of the quay: inside the free end clearance. */
export const CONNECTOR_INSET = 12.5;
/** Clearance between a connector road's edge and anything it must keep clear of. */
export const CONNECTOR_CLEARANCE = 4;
/** Width of a connector road. */
export const ROAD_WIDTH = 4.5;

export interface QuayConfig {
  /** Length of the ship the berth is sized for, metres. */
  shipLength: number;
  /** Middle of the berth along the quay (x). */
  centreX: number;
  /** Landward edge of the quay paving (z). Everything of the quay lies at z ≥ landZ. */
  landZ: number;
  /** Shown on the berth marking. */
  berthName?: string;
  /**
   * An x range the roads joining the apron must stay out of (the yard block and its crane). When the
   * quay's free ends fall inside it, the connector moves out past it and the apron lanes run on to meet it.
   */
  keepClear?: [number, number];
}

export interface ApronLane {
  /** 1 is the lane nearest the land (the one trucks from the yard use); numbers rise toward the water. */
  number: number;
  /** Lane centreline. */
  z: number;
  width: number;
}

export interface QuayLayout {
  config: QuayConfig;
  /** Quay (and berth) extent along x. */
  x0: number;
  x1: number;
  length: number;
  berth: { name: string; x0: number; x1: number; length: number };
  /** Where the ship's hull ends lie when centred on the berth. */
  ship: { x0: number; x1: number; length: number };
  /** Paving from landZ to edgeZ; water beyond edgeZ. */
  landZ: number;
  edgeZ: number;
  rails: { landZ: number; waterZ: number; gauge: number };
  /** Apron truck lanes between the crane rails, lane 1 nearest the land. */
  lanes: ApronLane[];
  /** Where the apron lanes start and end along x: the whole quay, and on to the connectors if they lie beyond it. */
  apron: { x0: number; x1: number };
  /** The strip behind the landside rail kept free for hatch covers. */
  backreach: { z0: number; z1: number };
  bollards: { x: number; z: number }[];
  /** x of the roads joining the apron at its west and east ends. */
  connectors: { westX: number; eastX: number };
}

export function quayLayout(config: QuayConfig): QuayLayout {
  const { shipLength, centreX, landZ } = config;
  if (!(shipLength > 0)) throw new Error('A berth needs a ship longer than 0 m.');
  const length = shipLength + 2 * BERTH_END_CLEARANCE;
  const x0 = centreX - length / 2;
  const x1 = centreX + length / 2;

  const backreach = { z0: landZ + LANDSIDE_MARGIN, z1: landZ + LANDSIDE_MARGIN + BACKREACH_DEPTH };
  const railLand = backreach.z1 + BACKREACH_SETBACK;
  const railWater = railLand + RAIL_GAUGE;
  const edgeZ = railWater + WATERSIDE_RAIL_SETBACK;

  // Lanes packed together, centred between the rails.
  const band = APRON_LANE_COUNT * APRON_LANE_WIDTH + (APRON_LANE_COUNT - 1) * APRON_LANE_GAP;
  const first = (railLand + railWater) / 2 - band / 2 + APRON_LANE_WIDTH / 2;
  const lanes: ApronLane[] = Array.from({ length: APRON_LANE_COUNT }, (_, i) => ({
    number: i + 1,
    z: first + i * (APRON_LANE_WIDTH + APRON_LANE_GAP),
    width: APRON_LANE_WIDTH,
  }));

  // Bollards evenly along the berth, one at each end.
  const n = Math.max(1, Math.round(length / BOLLARD_SPACING));
  const bollards = Array.from({ length: n + 1 }, (_, i) => ({ x: x0 + (i * length) / n, z: edgeZ - BOLLARD_SETBACK }));

  let westX = x0 + CONNECTOR_INSET;
  let eastX = x1 - CONNECTOR_INSET;
  if (config.keepClear) {
    const [lo, hi] = config.keepClear;
    westX = Math.min(westX, lo - ROAD_WIDTH / 2 - CONNECTOR_CLEARANCE);
    eastX = Math.max(eastX, hi + ROAD_WIDTH / 2 + CONNECTOR_CLEARANCE);
  }

  return {
    config,
    x0,
    x1,
    length,
    berth: { name: config.berthName ?? 'Berth 1', x0, x1, length },
    ship: { x0: centreX - shipLength / 2, x1: centreX + shipLength / 2, length: shipLength },
    landZ,
    edgeZ,
    rails: { landZ: railLand, waterZ: railWater, gauge: RAIL_GAUGE },
    lanes,
    apron: { x0: Math.min(x0, westX), x1: Math.max(x1, eastX) },
    backreach,
    bollards,
    connectors: { westX, eastX },
  };
}

/** "Berth 1 · 200 m" */
export const berthLabel = (q: QuayLayout) => `${q.berth.name} · ${Math.round(q.berth.length)} m`;
