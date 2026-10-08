import type { GroupProps } from '@react-three/fiber';
import { materials } from '../materials';
import { Axle, Slab } from '../parts';
import { TRACTOR, WHEEL } from './spec';

const W = TRACTOR.width / 2;

/** Cab-over 6×4 tractor unit. Origin: ground below the fifth-wheel centre, facing +X. */
export function Tractor(props: GroupProps) {
  const { cab, frameY, frameZ } = TRACTOR;
  const fw = TRACTOR.fifthWheelTopY;
  return (
    <group {...props}>
      {/* Chassis rails */}
      {[-frameZ, frameZ].map((z) => (
        <Slab key={z} from={[TRACTOR.rearEndX, frameY[0], z - 0.06]} to={[cab.frontX - 0.2, frameY[1], z + 0.06]} material={materials.frame} />
      ))}
      <Slab from={[TRACTOR.rearEndX, frameY[0], -frameZ]} to={[TRACTOR.rearEndX + 0.12, frameY[1], frameZ]} material={materials.frame} />

      {/* Fifth wheel: mounting, plate and the V-shaped throat the kingpin slides into */}
      <Slab from={[-0.45, frameY[1], -0.5]} to={[0.45, fw - 0.08, 0.5]} material={materials.frame} />
      <mesh position={[0, fw - 0.04, 0]} material={materials.steelDark} castShadow receiveShadow>
        <cylinderGeometry args={[TRACTOR.fifthWheelRadius, TRACTOR.fifthWheelRadius, 0.08, 28]} />
      </mesh>
      <Slab from={[-TRACTOR.fifthWheelRadius - 0.01, fw - 0.02, -0.06]} to={[0, fw + 0.002, 0.06]} material={materials.rubber} shadow={false} />
      {[-1, 1].map((s) => (
        <mesh key={s} position={[-0.32, fw - 0.01, s * 0.12]} rotation-y={s * 0.45} material={materials.rubber}>
          <boxGeometry args={[0.32, 0.02, 0.06]} />
        </mesh>
      ))}

      {/* Rear mudguards */}
      {[-1, 1].map((s) => (
        <Slab key={s} from={[-1.55, 1.12, s * 0.925 - 0.36]} to={[0.95, 1.16, s * 0.925 + 0.36]} material={materials.frame} />
      ))}

      {/* Cab */}
      <group>
        <Slab from={[cab.backX, cab.bottomY, -W]} to={[cab.frontX, cab.topY - 0.25, W]} material={materials.brand} />
        <Slab from={[cab.backX + 0.1, cab.topY - 0.25, -W + 0.08]} to={[cab.frontX - 0.15, cab.topY, W - 0.08]} material={materials.brand} />
        {/* Roof fairing */}
        <Slab from={[cab.backX + 0.25, cab.topY, -W + 0.2]} to={[cab.frontX - 0.6, cab.topY + 0.25, W - 0.2]} material={materials.white} />
        {/* Windscreen and side windows */}
        <Slab from={[cab.frontX - 0.005, 2.15, -W + 0.12]} to={[cab.frontX + 0.01, cab.topY - 0.32, W - 0.12]} material={materials.glass} shadow={false} />
        {[-1, 1].map((s) => (
          <Slab key={s} from={[cab.frontX - 0.85, 2.15, s * W - 0.01]} to={[cab.frontX - 0.12, cab.topY - 0.35, s * W + 0.01]} material={materials.glass} shadow={false} />
        ))}
        {/* Door seams */}
        {[-1, 1].map((s) => (
          <Slab key={s} from={[cab.frontX - 0.95, 1.2, s * W - 0.008]} to={[cab.frontX - 0.92, 3.0, s * W + 0.008]} material={materials.brandDark} shadow={false} />
        ))}
        {/* Grille, bumper and lights */}
        <Slab from={[cab.frontX - 0.005, 1.35, -0.75]} to={[cab.frontX + 0.015, 1.95, 0.75]} material={materials.frame} shadow={false} />
        {[1.47, 1.62, 1.77].map((y) => (
          <Slab key={y} from={[cab.frontX + 0.01, y, -0.72]} to={[cab.frontX + 0.025, y + 0.04, 0.72]} material={materials.steel} shadow={false} />
        ))}
        <Slab from={[cab.frontX - 0.1, 0.62, -W + 0.02]} to={[TRACTOR.frontEndX, 1.1, W - 0.02]} material={materials.steel} />
        {[-1, 1].map((s) => (
          <Slab key={s} from={[TRACTOR.frontEndX - 0.01, 0.8, s * (W - 0.4) - 0.2]} to={[TRACTOR.frontEndX + 0.01, 0.98, s * (W - 0.4) + 0.2]} material={materials.light} shadow={false} />
        ))}
        {/* Mirrors */}
        {[-1, 1].map((s) => (
          <group key={s}>
            <Slab from={[cab.frontX - 0.2, 2.5, s * W]} to={[cab.frontX - 0.14, 2.54, s * (W + 0.25)]} material={materials.frame} />
            <Slab from={[cab.frontX - 0.22, 2.1, s * (W + 0.22) - 0.04]} to={[cab.frontX - 0.12, 2.6, s * (W + 0.22) + 0.04]} material={materials.frame} />
          </group>
        ))}
        {/* Steps */}
        {[-1, 1].map((s) => (
          <Slab key={s} from={[cab.frontX - 1.0, 0.55, s * W - 0.12]} to={[cab.frontX - 0.45, 0.6, s * W + 0.04 * s]} material={materials.frame} />
        ))}
      </group>

      {/* Behind the cab: fuel tank, air tank and exhaust stack */}
      <mesh position={[1.9, 0.78, -W + 0.32]} rotation-z={Math.PI / 2} material={materials.steel} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 1.1, 16]} />
      </mesh>
      <mesh position={[1.9, 0.82, W - 0.3]} rotation-z={Math.PI / 2} material={materials.steelDark} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.9, 14]} />
      </mesh>
      <mesh position={[cab.backX - 0.12, 2.4, W - 0.3]} material={materials.steel} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 2.6, 10]} />
      </mesh>
      <Slab from={[cab.backX - 0.35, 1.1, -0.8]} to={[cab.backX - 0.05, 1.16, 0.8]} material={materials.steelDark} />

      {/* Axles: steer axle with single wheels, tandem drive axles with duals */}
      <Axle x={TRACTOR.frontAxleX} track={2.05} />
      {TRACTOR.rearAxlesX.map((x) => (
        <Axle key={x} x={x} track={1.85} dual />
      ))}
      {/* Wheel arches under the cab */}
      {[-1, 1].map((s) => (
        <Slab key={s} from={[TRACTOR.frontAxleX - WHEEL.radius - 0.1, 1.05, s * W - 0.2]} to={[TRACTOR.frontAxleX + WHEEL.radius + 0.1, 1.12, s * W + 0.005 * s]} material={materials.brandDark} />
      ))}
    </group>
  );
}
