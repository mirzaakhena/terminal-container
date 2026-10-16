import { useMemo } from 'react';
import { MeshBasicMaterial } from 'three';
import { palette } from '../../config/theme';
import { materials } from '../materials';
import { Slab } from '../parts';
import { Label } from '../../scene/Label';
import { RoadRibbon } from '../../scene/RoadRibbon';
import type { P2 } from '../../motion/route';
import { berthLabel, type QuayLayout } from './layout';

/** Height of the quay deck above the water. The water itself is drawn by the ground (see Ground's `shoreZ`). */
export const QUAY_FREEBOARD = 1.6;

const pavingMat = new MeshBasicMaterial({ color: palette.quay });
const laneMat = new MeshBasicMaterial({ color: palette.asphalt });
const laneLineMat = new MeshBasicMaterial({ color: '#ffffff' });
const railMat = new MeshBasicMaterial({ color: palette.craneRail });
const markMat = new MeshBasicMaterial({ color: palette.marking });
const LINE = 0.15;

/** A flat painted rectangle on the deck. */
function Paint({ x0, z0, x1, z1, y, material }: { x0: number; z0: number; x1: number; z1: number; y: number; material: MeshBasicMaterial }) {
  return (
    <mesh position={[(x0 + x1) / 2, y, (z0 + z1) / 2]} rotation-x={-Math.PI / 2} material={material}>
      <planeGeometry args={[x1 - x0, z1 - z0]} />
    </mesh>
  );
}

/** A mooring bollard: a short post with a wider cap. */
function Bollard({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position-y={0.3} material={materials.steelDark} castShadow>
        <cylinderGeometry args={[0.26, 0.32, 0.6, 14]} />
      </mesh>
      <mesh position-y={0.66} material={materials.steelDark} castShadow>
        <cylinderGeometry args={[0.4, 0.34, 0.14, 14]} />
      </mesh>
    </group>
  );
}

/**
 * The quayside in the yard frame: paving, crane rails, apron lanes, the backreach kept for hatch covers,
 * the quay edge with its coping, fenders and bollards, and the berth marking.
 */
export function Quayside({ quay }: { quay: QuayLayout }) {
  const { x0, x1, landZ, edgeZ, lanes, rails, backreach, ship } = quay;
  const { apron } = quay;
  const lanePaths = useMemo(() => lanes.map((l): P2[] => [[apron.x0, l.z], [apron.x1, l.z]]), [lanes, apron]);
  const fenders = useMemo(() => {
    const out: number[] = [];
    for (let i = 0; i < quay.bollards.length - 1; i++) out.push((quay.bollards[i].x + quay.bollards[i + 1].x) / 2);
    return out;
  }, [quay.bollards]);
  const midX = (x0 + x1) / 2;
  const t = LINE / 2;

  return (
    <group name="quayside">
      {/* Deck paving and the quay wall down to the water */}
      <Paint x0={x0} z0={landZ} x1={x1} z1={edgeZ} y={0.006} material={pavingMat} />
      <mesh position={[midX, 0.02, (landZ + edgeZ) / 2]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[x1 - x0, edgeZ - landZ]} />
        <shadowMaterial color={palette.shadow} opacity={0.22} transparent />
      </mesh>

      {/* Quay crane rails */}
      {[rails.landZ, rails.waterZ].map((z) => (
        <Paint key={z} x0={x0} z0={z - 0.2} x1={x1} z1={z + 0.2} y={0.012} material={railMat} />
      ))}

      {/* Apron truck lanes, painted like the yard lane */}
      <group name="apron-lanes">
        {lanePaths.map((p, i) => (
          <group key={lanes[i].number}>
            <RoadRibbon points={p} width={lanes[i].width} material={laneMat} />
            <RoadRibbon points={p} width={0.12} y={0.015} material={laneLineMat} />
          </group>
        ))}
      </group>
      <Label position={[x0 + 4, 0.1, (lanes[0].z + lanes[lanes.length - 1].z) / 2]} title="Apron" detail={`lanes 1–${lanes.length}`} />

      {/* Backreach: kept free behind the landside legs, alongside the ship */}
      <group name="backreach">
        <Paint x0={ship.x0} z0={backreach.z0} x1={ship.x1} z1={backreach.z0 + LINE} y={0.013} material={markMat} />
        <Paint x0={ship.x0} z0={backreach.z1 - LINE} x1={ship.x1} z1={backreach.z1} y={0.013} material={markMat} />
        <Paint x0={ship.x0} z0={backreach.z0} x1={ship.x0 + LINE} z1={backreach.z1} y={0.013} material={markMat} />
        <Paint x0={ship.x1 - LINE} z0={backreach.z0} x1={ship.x1} z1={backreach.z1} y={0.013} material={markMat} />
      </group>
      <Label position={[midX, 0.1, (backreach.z0 + backreach.z1) / 2]} title="Backreach" detail="kept free for hatch covers" />

      {/* Quay edge: coping, fenders on the wall face, bollards, berth line and end marks */}
      <group name="berth">
        <Slab from={[x0, 0, edgeZ - 0.7]} to={[x1, 0.14, edgeZ]} material={materials.white} />
        {fenders.map((x) => (
          <Slab key={x} from={[x - 0.6, -QUAY_FREEBOARD + 0.45, edgeZ]} to={[x + 0.6, -0.15, edgeZ + 0.35]} material={materials.frame} />
        ))}
        {quay.bollards.map((b) => (
          <Bollard key={b.x} x={b.x} z={b.z - 0.15} />
        ))}
        <Paint x0={x0} z0={edgeZ - 1.9 - t} x1={x1} z1={edgeZ - 1.9 + t} y={0.013} material={markMat} />
        {[x0, x1 - 0.6].map((x) => (
          <Paint key={x} x0={x} z0={edgeZ - 3.2} x1={x + 0.6} z1={edgeZ - 0.7} y={0.013} material={markMat} />
        ))}
      </group>
      <Label position={[midX, 0.4, edgeZ - 2.6]} title={berthLabel(quay)} detail={`for a ${Math.round(ship.length)} m ship`} />
    </group>
  );
}
