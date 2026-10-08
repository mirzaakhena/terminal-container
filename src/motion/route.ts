/**
 * Driving routes on the ground plane: straight lines joined by circular arcs.
 * Points are [x, z] in world metres. Heading is the three.js rotation about +Y that turns
 * a model facing +X to face the direction of travel: direction (dx, dz) → atan2(-dz, dx).
 */
export type P2 = [number, number];

interface Line { kind: 'line'; from: P2; to: P2; length: number }
interface Arc { kind: 'arc'; centre: P2; radius: number; start: number; sweep: number; length: number }
type Segment = Line | Arc;

export interface Pose { x: number; z: number; heading: number }

export interface Route {
  length: number;
  segments: Segment[];
  stops: Record<string, number>;
  at(s: number): Pose;
}

export const headingOf = (dx: number, dz: number) => Math.atan2(-dz, dx);
export const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

const sub = (a: P2, b: P2): P2 => [a[0] - b[0], a[1] - b[1]];
const len = (a: P2) => Math.hypot(a[0], a[1]);
const norm = (a: P2): P2 => { const l = len(a); return [a[0] / l, a[1] / l]; };

/**
 * Builds a route through the given points, rounding each interior corner with an arc of `radius`.
 * `stops` names points along the route by index into `points` (the route passes them at the corner's apex
 * for interior points), or by explicit distance.
 */
export function createRoute(points: P2[], radius: number, stops: Record<string, number | { at: number }> = {}): Route {
  if (points.length < 2) throw new Error('A route needs at least two points.');
  const segments: Segment[] = [];
  let cursor: P2 = points[0];
  const pointS: number[] = [0];
  let total = 0;

  const pushLine = (to: P2) => {
    const l = len(sub(to, cursor));
    if (l > 1e-9) {
      segments.push({ kind: 'line', from: cursor, to, length: l });
      total += l;
    }
    cursor = to;
  };

  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i];
    const dIn = norm(sub(p, points[i - 1]));
    const dOut = norm(sub(points[i + 1], p));
    const turn = wrapAngle(Math.atan2(dOut[1], dOut[0]) - Math.atan2(dIn[1], dIn[0]));
    if (Math.abs(turn) < 1e-6) {
      pushLine(p);
      pointS.push(total);
      continue;
    }
    const cut = radius * Math.tan(Math.abs(turn) / 2);
    const maxCut = Math.min(len(sub(p, cursor)), len(sub(points[i + 1], p)) / 2);
    if (cut > maxCut + 1e-9) throw new Error(`Corner ${i} is too tight for a ${radius} m radius.`);
    const t1: P2 = [p[0] - dIn[0] * cut, p[1] - dIn[1] * cut];
    pushLine(t1);
    // Centre lies to the left of travel for a left turn (positive turn in x/z maths), right otherwise.
    const side = Math.sign(turn);
    const nrm: P2 = [-dIn[1] * side, dIn[0] * side];
    const centre: P2 = [t1[0] + nrm[0] * radius, t1[1] + nrm[1] * radius];
    const start = Math.atan2(t1[1] - centre[1], t1[0] - centre[0]);
    const arcLen = radius * Math.abs(turn);
    segments.push({ kind: 'arc', centre, radius, start, sweep: turn, length: arcLen });
    pointS.push(total + arcLen / 2);
    total += arcLen;
    cursor = [p[0] + dOut[0] * cut, p[1] + dOut[1] * cut];
  }
  pushLine(points[points.length - 1]);
  pointS.push(total);

  const stopS: Record<string, number> = {};
  for (const [name, v] of Object.entries(stops)) stopS[name] = typeof v === 'number' ? pointS[v] : v.at;

  const at = (s: number): Pose => {
    let d = Math.min(Math.max(s, 0), total);
    for (const seg of segments) {
      if (d <= seg.length || seg === segments[segments.length - 1]) {
        const t = seg.length ? Math.min(d / seg.length, 1) : 0;
        if (seg.kind === 'line') {
          const dx = seg.to[0] - seg.from[0];
          const dz = seg.to[1] - seg.from[1];
          return { x: seg.from[0] + dx * t, z: seg.from[1] + dz * t, heading: headingOf(dx, dz) };
        }
        const a = seg.start + seg.sweep * t;
        const x = seg.centre[0] + seg.radius * Math.cos(a);
        const z = seg.centre[1] + seg.radius * Math.sin(a);
        const s1 = Math.sign(seg.sweep);
        // Tangent of a circle traversed with increasing angle is (-sin a, cos a).
        return { x, z, heading: headingOf(-Math.sin(a) * s1, Math.cos(a) * s1) };
      }
      d -= seg.length;
    }
    throw new Error('unreachable');
  };

  return { length: total, segments, stops: stopS, at };
}

/** Points along the route every `step` metres, for drawing it. */
export function sampleRoute(route: Route, step = 0.5): P2[] {
  const out: P2[] = [];
  for (let s = 0; s < route.length; s += step) {
    const p = route.at(s);
    out.push([p.x, p.z]);
  }
  const end = route.at(route.length);
  out.push([end.x, end.z]);
  return out;
}
