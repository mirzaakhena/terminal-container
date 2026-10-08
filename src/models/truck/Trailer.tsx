import type { GroupProps } from '@react-three/fiber';
import { Container } from '../container';
import { materials } from '../materials';
import { Axle, Slab } from '../parts';
import { placements, twistlockPositions, type TrailerLoad } from './loads';
import { TRAILER } from './spec';

const W = TRAILER.width / 2;
const LOCKS = twistlockPositions();
const BEAM_XS = [...new Set(LOCKS.map(([x]) => x))];
const BEAM_H = 0.14;
const LEG_FOOT_UP = 0.35;

export interface TrailerProps extends GroupProps {
  load?: TrailerLoad;
  /** Containers per slot colour (palette index or CSS colour). */
  colors?: Partial<Record<keyof TrailerLoad, string | number>>;
  /** Landing legs lowered to the ground, as when the trailer stands uncoupled. */
  legsDown?: boolean;
}

/** 40ft combination skeletal trailer. Origin: ground below the kingpin, facing +X. */
export function Trailer({ load = {}, colors = {}, legsDown = false, ...props }: TrailerProps) {
  const { deckY, plateY, railBottomY, railZ, neckX, frontX, rearX } = TRAILER;
  const footY = legsDown ? 0 : LEG_FOOT_UP;
  return (
    <group {...props}>
      {/* Front plate resting on the fifth wheel, with the kingpin hanging below it */}
      <Slab from={[-1.0, plateY, -0.9]} to={[frontX, plateY + 0.06, 0.9]} material={materials.steelDark} />
      <mesh position={[0, plateY - TRAILER.kingpin.length / 2, 0]} material={materials.steel} castShadow>
        <cylinderGeometry args={[TRAILER.kingpin.radius, TRAILER.kingpin.radius, TRAILER.kingpin.length, 12]} />
      </mesh>
      <mesh position={[0, plateY - TRAILER.kingpin.length + 0.01, 0]} material={materials.steel}>
        <cylinderGeometry args={[0.06, 0.06, 0.02, 12]} />
      </mesh>

      {/* Main rails: shallow over the tractor, deep behind the neck */}
      {[-railZ, railZ].map((z) => (
        <group key={z}>
          <Slab from={[neckX, plateY, z - 0.08]} to={[frontX - 0.05, deckY - 0.02, z + 0.08]} material={materials.frame} />
          <Slab from={[rearX + 0.05, railBottomY, z - 0.08]} to={[neckX, deckY - 0.02, z + 0.08]} material={materials.frame} />
          <mesh position={[neckX - 0.25, (railBottomY + plateY) / 2, z]} rotation-z={-0.6} material={materials.frame} castShadow>
            <boxGeometry args={[0.6, 0.12, 0.16]} />
          </mesh>
        </group>
      ))}

      {/* Cross beams carrying the twistlocks, plus front and rear end beams */}
      {BEAM_XS.map((x) => (
        <Slab key={x} from={[x - 0.1, deckY - BEAM_H, -W]} to={[x + 0.1, deckY, W]} material={materials.frame} />
      ))}
      <Slab from={[frontX - 0.12, deckY - 0.3, -W]} to={[frontX, deckY, W]} material={materials.frame} />
      <Slab from={[rearX, railBottomY - 0.05, -W]} to={[rearX + 0.18, deckY, W]} material={materials.frame} />
      {/* Intermediate cross members */}
      {[-3.6, -6.5, -8.75, -10.05].map((x) => (
        <Slab key={x} from={[x - 0.05, deckY - 0.3, -railZ]} to={[x + 0.05, deckY - 0.08, railZ]} material={materials.frame} />
      ))}

      {/* Twistlocks: a base on the beam and a head that enters the container's corner casting */}
      {LOCKS.map(([x, z]) => (
        <group key={`${x},${z}`} position={[x, deckY, z]}>
          <mesh position-y={0.025} material={materials.amber} castShadow>
            <boxGeometry args={[0.1, 0.05, 0.06]} />
          </mesh>
          <mesh position={[0, 0.02, z > 0 ? 0.08 : -0.08]} material={materials.amber}>
            <boxGeometry args={[0.04, 0.02, 0.08]} />
          </mesh>
        </group>
      ))}

      {/* Landing legs */}
      {[-TRAILER.landingLegZ, TRAILER.landingLegZ].map((z) => (
        <group key={z}>
          <Slab from={[TRAILER.landingLegX - 0.08, footY + 0.1, z - 0.08]} to={[TRAILER.landingLegX + 0.08, railBottomY, z + 0.08]} material={materials.steelDark} />
          <Slab from={[TRAILER.landingLegX - 0.18, footY, z - 0.15]} to={[TRAILER.landingLegX + 0.18, footY + 0.1, z + 0.15]} material={materials.frame} />
        </group>
      ))}
      <Slab from={[TRAILER.landingLegX - 0.03, 0.7, -TRAILER.landingLegZ]} to={[TRAILER.landingLegX + 0.03, 0.75, TRAILER.landingLegZ]} material={materials.steelDark} />
      <Slab from={[TRAILER.landingLegX - 0.03, 0.72, TRAILER.landingLegZ]} to={[TRAILER.landingLegX + 0.03, 0.76, W + 0.15]} material={materials.yellow} />

      {/* Tridem axles with duals, mudguards, rear bumper and lights */}
      {TRAILER.axlesX.map((x) => (
        <Axle key={x} x={x} track={1.85} dual />
      ))}
      {[-1, 1].map((s) => (
        <Slab key={s} from={[TRAILER.axlesX[2] - 0.65, railBottomY - 0.02, s * 0.925 - 0.36]} to={[TRAILER.axlesX[0] + 0.65, railBottomY + 0.02, s * 0.925 + 0.36]} material={materials.frame} />
      ))}
      <Slab from={[rearX - 0.05, 0.45, -W + 0.05]} to={[rearX + 0.08, 0.6, W - 0.05]} material={materials.steelDark} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Slab from={[rearX + 0.02, 0.6, s * W * 0.5]} to={[rearX + 0.08, railBottomY - 0.05, s * W * 0.5 + 0.08]} material={materials.steelDark} />
          <Slab from={[rearX - 0.01, deckY - 0.25, s * (W - 0.15) - 0.13]} to={[rearX + 0.01, deckY - 0.08, s * (W - 0.15) + 0.13]} material={materials.tail} shadow={false} />
        </group>
      ))}

      {/* Load: containers ride with their doors to the rear */}
      {placements(load).map((p) => (
        <Container key={p.slot} type={p.type} color={colors[p.slot] ?? 0} position={[p.x, deckY, 0]} rotation-y={Math.PI} />
      ))}
    </group>
  );
}
