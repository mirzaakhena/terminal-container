import { useMemo } from 'react';
import { BufferGeometry, Float32BufferAttribute } from 'three';
import { palette } from '../config/theme';

export const GROUND_SIZE = 600;
const GRID_HALF = 150;
const CELL = 10;
const SECTION = 50;

/** Line geometry for a square grid; lines every `step` metres, skipping multiples of `skip`. */
function gridLines(half: number, step: number, skip?: number): BufferGeometry {
  const pts: number[] = [];
  for (let v = -half; v <= half; v += step) {
    if (skip && v % skip === 0) continue;
    pts.push(v, 0, -half, v, 0, half, -half, 0, v, half, 0, v);
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pts, 3));
  return g;
}

/**
 * The yard floor. The colour is drawn unlit so it always matches the palette exactly;
 * a transparent shadow catcher on top adds the soft shadows.
 */
export function Ground({ showGrid }: { showGrid: boolean }) {
  const cells = useMemo(() => gridLines(GRID_HALF, CELL, SECTION), []);
  const sections = useMemo(() => gridLines(GRID_HALF, SECTION), []);
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
        <meshBasicMaterial color={palette.ground} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.005} receiveShadow>
        <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
        <shadowMaterial color={palette.shadow} opacity={0.22} transparent />
      </mesh>
      {showGrid && (
        <group name="reference-grid" position-y={0.02}>
          <lineSegments geometry={cells}>
            <lineBasicMaterial color={palette.groundLine} />
          </lineSegments>
          <lineSegments geometry={sections}>
            <lineBasicMaterial color={palette.groundSection} />
          </lineSegments>
        </group>
      )}
    </group>
  );
}
