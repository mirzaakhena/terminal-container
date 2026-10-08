import { TRACTOR, TRAILER } from '../models/truck/spec';
import { headingOf, wrapAngle, type Pose, type Route } from './route';

/**
 * Drives a tractor-trailer along a route.
 *  - The tractor's rear (drive) axle stays on the route and the tractor points along it.
 *  - The kingpin sits a fixed distance ahead of that axle.
 *  - The trailer's axle group is towed by the kingpin: each step it moves straight toward the
 *    kingpin's new position, keeping its distance (the classic tractrix that makes trailers cut corners).
 */

/** Tractor drive-axle centre to kingpin, along the tractor. */
export const KINGPIN_AHEAD = -(TRACTOR.rearAxlesX[0] + TRACTOR.rearAxlesX[1]) / 2;
/** Kingpin to the centre of the trailer's axle group. */
export const TRAILER_WHEELBASE = -(TRAILER.axlesX.reduce((a, b) => a + b, 0) / TRAILER.axlesX.length);
/** Largest angle between tractor and trailer before parts would touch. */
export const MAX_ARTICULATION = (75 * Math.PI) / 180;

export const SPEED = { max: 4.2, accel: 0.9, decel: 1.1 } as const; // m/s, m/s² — yard speed ~15 km/h

export interface TruckPose {
  /** Kingpin on the ground: the truck model's origin. */
  x: number;
  z: number;
  /** Tractor heading. */
  heading: number;
  /** Tractor heading minus trailer heading. */
  articulation: number;
  /** Centre of the trailer's axle group, for tracing its path. */
  trailerAxle: [number, number];
  /** Centre of the tractor's drive axles. */
  driveAxle: [number, number];
  s: number;
  speed: number;
}

const kingpinFrom = (p: Pose): [number, number] => [
  p.x + Math.cos(p.heading) * KINGPIN_AHEAD,
  p.z - Math.sin(p.heading) * KINGPIN_AHEAD,
];

/**
 * The largest tractor–trailer angle a route would need if nothing limited it, found by towing a
 * trailer along it in small steps from a straight start.
 */
export function peakArticulation(route: Route, step = 0.05): number {
  const p0 = route.at(0);
  const [kx0, kz0] = kingpinFrom(p0);
  let axle: [number, number] = [kx0 - Math.cos(p0.heading) * TRAILER_WHEELBASE, kz0 + Math.sin(p0.heading) * TRAILER_WHEELBASE];
  let peak = 0;
  for (let s = step; s <= route.length; s += step) {
    const p = route.at(s);
    const [kx, kz] = kingpinFrom(p);
    const dx = kx - axle[0];
    const dz = kz - axle[1];
    const d = Math.hypot(dx, dz);
    axle = [kx - (dx / d) * TRAILER_WHEELBASE, kz - (dz / d) * TRAILER_WHEELBASE];
    peak = Math.max(peak, Math.abs(wrapAngle(p.heading - headingOf(dx, dz))));
  }
  return peak;
}

export class TruckMotion {
  s = 0;
  speed = 0;
  target: number | null = null;
  /** The largest trailer angle this route asks for (radians); above MAX_ARTICULATION the route is refused. */
  readonly peakArticulation: number;
  private axle: [number, number];

  /** `acceptTightCorners` skips the route check, leaving only the hard limit in the motion itself (for tests). */
  constructor(public route: Route, start = 0, opts: { acceptTightCorners?: boolean } = {}) {
    this.s = start;
    this.axle = this.straightTrailerAxle();
    this.peakArticulation = peakArticulation(route);
    this.acceptTightCorners = !!opts.acceptTightCorners;
  }
  private acceptTightCorners: boolean;

  /** Why this route cannot be driven, or null when it can. */
  get routeProblem(): string | null {
    if (this.acceptTightCorners || this.peakArticulation <= MAX_ARTICULATION) return null;
    const deg = (r: number) => Math.round((r * 180) / Math.PI);
    return `This route has a corner too tight for the truck: the trailer would have to swing ${deg(this.peakArticulation)}° against the tractor, and ${deg(MAX_ARTICULATION)}° is the limit. Use wider corners.`;
  }

  /** Trailer lined up behind the tractor, as when the truck has been driving straight. */
  private straightTrailerAxle(): [number, number] {
    const p = this.route.at(this.s);
    const [kx, kz] = kingpinFrom(p);
    return [kx - Math.cos(p.heading) * TRAILER_WHEELBASE, kz + Math.sin(p.heading) * TRAILER_WHEELBASE];
  }

  reset(start = 0) {
    this.s = start;
    this.speed = 0;
    this.target = null;
    this.axle = this.straightTrailerAxle();
  }

  /** Drive forward and stop at a distance along the route (a name from route.stops, or metres). */
  driveTo(stop: string | number) {
    const problem = this.routeProblem;
    if (problem) throw new Error(problem);
    const s = typeof stop === 'number' ? stop : this.route.stops[stop];
    if (s === undefined) throw new Error(`No stop called ${stop} on this route.`);
    if (s < this.s - 1e-6) throw new Error('Trucks only drive forward along a route.');
    this.target = Math.min(s, this.route.length);
  }

  get moving() {
    return this.target !== null;
  }

  /** Advance the simulation by dt seconds (use small steps; larger dt is split internally). */
  step(dt: number) {
    const n = Math.max(1, Math.ceil(dt / 0.02));
    for (let i = 0; i < n; i++) this.tick(dt / n);
  }

  private tick(dt: number) {
    if (this.target === null) return;
    const remaining = this.target - this.s;
    if (remaining <= 0.002) {
      this.s = this.target;
      this.speed = 0;
      this.target = null;
      this.towTrailer();
      return;
    }
    const brake = Math.sqrt(2 * SPEED.decel * remaining);
    this.speed = Math.max(0.15, Math.min(SPEED.max, this.speed + SPEED.accel * dt, brake));
    const ds = Math.min(this.speed * dt, remaining);
    this.s += ds;
    this.towTrailer();
  }

  private towTrailer() {
    const p = this.route.at(this.s);
    const [kx, kz] = kingpinFrom(p);
    const dx = kx - this.axle[0];
    const dz = kz - this.axle[1];
    const d = Math.hypot(dx, dz);
    this.axle = [kx - (dx / d) * TRAILER_WHEELBASE, kz - (dz / d) * TRAILER_WHEELBASE];
    // Hard limit: the trailer can never swing further than its stop against the tractor.
    const art = wrapAngle(p.heading - headingOf(dx, dz));
    if (Math.abs(art) > MAX_ARTICULATION) {
      const h = p.heading - Math.sign(art) * MAX_ARTICULATION;
      this.axle = [kx - Math.cos(h) * TRAILER_WHEELBASE, kz + Math.sin(h) * TRAILER_WHEELBASE];
    }
  }

  pose(): TruckPose {
    const p = this.route.at(this.s);
    const [kx, kz] = kingpinFrom(p);
    const trailerHeading = headingOf(kx - this.axle[0], kz - this.axle[1]);
    let articulation = wrapAngle(p.heading - trailerHeading);
    articulation = Math.max(-MAX_ARTICULATION, Math.min(MAX_ARTICULATION, articulation));
    return {
      x: kx,
      z: kz,
      heading: p.heading,
      articulation,
      trailerAxle: [...this.axle],
      driveAxle: [p.x, p.z],
      s: this.s,
      speed: this.speed,
    };
  }
}
