import { describe, expect, it } from 'vitest';
import { createRoute, headingOf } from './route';
import { MAX_ARTICULATION, TRAILER_WHEELBASE, TruckMotion } from './truckMotion';

const R = 16;
/** Straight east 40 m, a 90° left turn (towards -Z, since +Z points "south" on screen), then 40 m. */
const route = () => createRoute([[0, 0], [60, 0], [60, -60]], R, { corner: 1, end: 2, half: { at: 30 } });

const run = (m: TruckMotion, onStep?: () => void) => {
  for (let i = 0; i < 20000 && m.moving; i++) {
    m.step(1 / 60);
    onStep?.();
  }
};

describe('route', () => {
  it('rounds the corner: length is two straights plus a quarter circle', () => {
    const r = route();
    const cut = R; // tan(45°) = 1
    expect(r.length).toBeCloseTo(60 - cut + (Math.PI / 2) * R + 60 - cut, 6);
  });

  it('heading turns smoothly from east to north', () => {
    const r = route();
    expect(r.at(0).heading).toBeCloseTo(headingOf(1, 0), 6);
    expect(r.at(r.length).heading).toBeCloseTo(headingOf(0, -1), 6);
    let prev = r.at(0);
    for (let s = 0.5; s <= r.length; s += 0.5) {
      const p = r.at(s);
      expect(Math.hypot(p.x - prev.x, p.z - prev.z)).toBeCloseTo(0.5, 2);
      prev = p;
    }
  });

  it('refuses corners too tight for the radius', () => {
    expect(() => createRoute([[0, 0], [10, 0], [10, -10]], 30)).toThrow(/too tight/);
  });
});

describe('truck motion', () => {
  it('stops at a named stop within 10 cm', () => {
    const m = new TruckMotion(route());
    m.driveTo('half');
    run(m);
    expect(Math.abs(m.pose().s - 30)).toBeLessThan(0.1);
    m.driveTo('end');
    run(m);
    expect(Math.abs(m.pose().s - m.route.length)).toBeLessThan(0.1);
    expect(m.speed).toBe(0);
  });

  it('trailer angles in the corner and straightens afterwards', () => {
    const m = new TruckMotion(route());
    m.driveTo('end');
    let peak = 0;
    run(m, () => (peak = Math.max(peak, Math.abs(m.pose().articulation))));
    expect(peak).toBeGreaterThan((15 * Math.PI) / 180);
    expect(peak).toBeLessThan(MAX_ARTICULATION);
    expect(Math.abs(m.pose().articulation)).toBeLessThan((2 * Math.PI) / 180);
  });

  it('trailer wheels cut inside the tractor path', () => {
    const r = route();
    const arc = r.segments.find((s) => s.kind === 'arc')!;
    if (arc.kind !== 'arc') throw new Error();
    const m = new TruckMotion(r);
    m.driveTo('end');
    let minTrailer = Infinity;
    let minTractor = Infinity;
    run(m, () => {
      const p = m.pose();
      minTrailer = Math.min(minTrailer, Math.hypot(p.trailerAxle[0] - arc.centre[0], p.trailerAxle[1] - arc.centre[1]));
      minTractor = Math.min(minTractor, Math.hypot(p.driveAxle[0] - arc.centre[0], p.driveAxle[1] - arc.centre[1]));
    });
    expect(minTractor).toBeCloseTo(R, 1);
    expect(minTrailer).toBeLessThan(R - 1);
  });

  it('keeps the trailer at a fixed distance behind the kingpin', () => {
    const m = new TruckMotion(route());
    m.driveTo('end');
    run(m, () => {
      const p = m.pose();
      expect(Math.hypot(p.x - p.trailerAxle[0], p.z - p.trailerAxle[1])).toBeCloseTo(TRAILER_WHEELBASE, 3);
    });
  });

  it('only drives forward', () => {
    const m = new TruckMotion(route(), 30);
    expect(() => m.driveTo(10)).toThrow(/forward/);
  });
});
