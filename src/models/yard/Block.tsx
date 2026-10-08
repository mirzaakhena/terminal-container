import { useMemo } from 'react';
import type { GroupProps } from '@react-three/fiber';
import { MeshBasicMaterial } from 'three';
import { palette } from '../../config/theme';
import { Container } from '../container';
import { Label } from '../../scene/Label';
import { BAY_PITCH, BLOCK_MARGIN, ROW_PITCH, blockLength, blockWidth, slotPosition, type BlockState } from './layout';

const padMat = new MeshBasicMaterial({ color: palette.asphalt });
const outlineMat = new MeshBasicMaterial({ color: palette.marking });
const slotMat = new MeshBasicMaterial({ color: '#ffffff' });
const LINE = 0.12;

/** A flat painted strip on the ground, from (x0, z0) to (x1, z1). */
function Strip({ x0, z0, x1, z1, y, material }: { x0: number; z0: number; x1: number; z1: number; y: number; material: MeshBasicMaterial }) {
  return (
    <mesh position={[(x0 + x1) / 2, y, (z0 + z1) / 2]} rotation-x={-Math.PI / 2} material={material}>
      <planeGeometry args={[Math.max(x1 - x0, LINE), Math.max(z1 - z0, LINE)]} />
    </mesh>
  );
}

export interface BlockProps extends GroupProps {
  state: BlockState;
  name?: string;
  showLabels?: boolean;
}

/** A storage block: painted pad and slots, bay/row numbers, and its containers. Origin at the block corner. */
export function Block({ state, name, showLabels = true, ...group }: BlockProps) {
  const { config } = state;
  const L = blockLength(config);
  const W = blockWidth(config);
  const x0 = BLOCK_MARGIN;
  const z0 = BLOCK_MARGIN;
  const x1 = L - BLOCK_MARGIN;
  const z1 = W - BLOCK_MARGIN;

  const markings = useMemo(() => {
    const strips: JSX.Element[] = [];
    // Outline
    strips.push(<Strip key="o1" x0={0} z0={0} x1={L} z1={LINE} y={0.012} material={outlineMat} />);
    strips.push(<Strip key="o2" x0={0} z0={W - LINE} x1={L} z1={W} y={0.012} material={outlineMat} />);
    strips.push(<Strip key="o3" x0={0} z0={0} x1={LINE} z1={W} y={0.012} material={outlineMat} />);
    strips.push(<Strip key="o4" x0={L - LINE} z0={0} x1={L} z1={W} y={0.012} material={outlineMat} />);
    // Row lines along the block, bay lines across it
    for (let r = 0; r <= config.rows; r++) {
      const z = z0 + r * ROW_PITCH;
      strips.push(<Strip key={`r${r}`} x0={x0} z0={z - LINE / 2} x1={x1} z1={z + LINE / 2} y={0.014} material={slotMat} />);
    }
    for (let b = 0; b <= config.bays; b++) {
      const x = x0 + b * BAY_PITCH;
      strips.push(<Strip key={`b${b}`} x0={x - LINE / 2} z0={z0} x1={x + LINE / 2} z1={z1} y={0.014} material={slotMat} />);
    }
    return strips;
  }, [config.rows, config.bays, L, W, x0, x1, z0, z1]);

  const containers = Object.values(state.containers);

  return (
    <group {...group}>
      <mesh position={[L / 2, 0.008, W / 2]} rotation-x={-Math.PI / 2} material={padMat} receiveShadow>
        <planeGeometry args={[L, W]} />
      </mesh>
      {markings}

      {containers.map((c) => (
        <Container key={c.id} type={c.type} color={c.color ?? 0} position={slotPosition(state, c.type, c)} />
      ))}

      {showLabels && (
        <>
          {Array.from({ length: config.bays }, (_, i) => (
            <Label key={`bl${i}`} position={[x0 + (i + 0.5) * BAY_PITCH, 0.05, W + 0.9]} title={String(i * 2 + 1).padStart(2, '0')} />
          ))}
          {Array.from({ length: config.rows }, (_, r) => (
            <Label key={`rl${r}`} position={[L + 1.3, 0.05, z0 + (r + 0.5) * ROW_PITCH]} title={`R${String(r + 1).padStart(2, '0')}`} />
          ))}
          {name && <Label position={[L + 1.3, 0.05, W + 1.6]} title={name} detail={`${config.bays} bays · ${config.rows} rows · ${config.tiers} high`} />}
        </>
      )}
    </group>
  );
}
