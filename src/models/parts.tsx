import type { Material } from 'three';
import { materials } from './materials';
import { WHEEL } from './truck/spec';

type V3 = [number, number, number];

/** An axis-aligned box given by its min and max corners — easier to read than centre + size for vehicle parts. */
export function Slab({ from, to, material, shadow = true }: { from: V3; to: V3; material: Material; shadow?: boolean }) {
  const size: V3 = [to[0] - from[0], to[1] - from[1], to[2] - from[2]];
  const centre: V3 = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2];
  return (
    <mesh position={centre} material={material} castShadow={shadow} receiveShadow>
      <boxGeometry args={size} />
    </mesh>
  );
}

/** A tyre with hub, axle along Z. `dual` draws twin tyres as on drive and trailer axles. */
export function Wheel({ position, dual = false }: { position: V3; dual?: boolean }) {
  const { radius, width, hubRadius } = WHEEL;
  const offsets = dual ? [-width / 2 - 0.02, width / 2 + 0.02] : [0];
  return (
    <group position={position}>
      {offsets.map((dz) => (
        <group key={dz} position-z={dz} rotation-x={Math.PI / 2}>
          <mesh material={materials.rubber} castShadow>
            <cylinderGeometry args={[radius, radius, width, 20]} />
          </mesh>
          <mesh material={materials.steel}>
            <cylinderGeometry args={[hubRadius, hubRadius, width + 0.01, 14]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** An axle with a wheel (or dual pair) on each side. `track` is the distance between wheel centres. */
export function Axle({ x, track, dual = false }: { x: number; track: number; dual?: boolean }) {
  const r = WHEEL.radius;
  return (
    <group>
      <Wheel position={[x, r, -track / 2]} dual={dual} />
      <Wheel position={[x, r, track / 2]} dual={dual} />
      <mesh position={[x, r, 0]} rotation-x={Math.PI / 2} material={materials.frame}>
        <cylinderGeometry args={[0.07, 0.07, track - 0.3, 8]} />
      </mesh>
    </group>
  );
}
