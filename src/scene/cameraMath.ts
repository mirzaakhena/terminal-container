export type Vec3 = [number, number, number];

/** Isometric-style starting view: looking at the origin from the south-east, about 35° above the horizon. */
export const HOME_TARGET: Vec3 = [0, 0, 0];
export const HOME_POSITION: Vec3 = [44, 39, 44];

/** The home view at a given distance from the target, same direction as HOME_POSITION. */
export function homePosition(distance?: number): Vec3 {
  if (distance === undefined) return HOME_POSITION;
  const k = distance / length(HOME_POSITION);
  return [HOME_POSITION[0] * k, HOME_POSITION[1] * k, HOME_POSITION[2] * k];
}

export const MIN_DISTANCE = 12;
export const MAX_DISTANCE = 420;

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
export const length = (a: Vec3): number => Math.hypot(a[0], a[1], a[2]);

/** Moves the camera toward (factor < 1) or away from (factor > 1) the target, clamped to the allowed distance. */
export function dolly(position: Vec3, target: Vec3, factor: number): Vec3 {
  const offset = sub(position, target);
  const dist = length(offset);
  const next = Math.min(MAX_DISTANCE, Math.max(MIN_DISTANCE, dist * factor));
  return add(target, scale(offset, next / dist));
}

/** Rotates the camera around the vertical axis through the target. Positive angle turns counter-clockwise seen from above. */
export function orbitY(position: Vec3, target: Vec3, angle: number): Vec3 {
  const [x, y, z] = sub(position, target);
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return add(target, [x * c + z * s, y, -x * s + z * c]);
}
