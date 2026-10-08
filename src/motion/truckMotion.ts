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

export class TruckMotion {
  s = 0;
  speed = 0;
  target: number | null = null;
  private axle: [number, number];

  constructor(public route: Route, start = 0) {
    this.s = start;
    this.axle = this.straightTrailerAxle();
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
    const [kx, kz] = kingpinFrom(this.route.at(this.s));
    const dx = kx - this.axle[0];
    const dz = kz - this.axle[1];
    const d = Math.hypot(dx, dz);
    this.axle = [kx - (dx / d) * TRAILER_WHEELBASE, kz - (dz / d) * TRAILER_WHEELBASE];
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
