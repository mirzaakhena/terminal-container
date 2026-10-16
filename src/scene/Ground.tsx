import { useMemo } from 'react';
import { BufferGeometry, Float32BufferAttribute } from 'three';
import { palette } from '../config/theme';

export const GROUND_SIZE = 600;
const GRID_HALF = 150;
const CELL = 10;
const SECTION = 50;
/** How far below the land the water surface lies, where a view has a shore. */
export const WATER_LEVEL = -1.6;

/** Line geometry for a square grid; lines every `step` metres, skipping multiples of `skip`, cut off at `maxZ`. */
function gridLines(half: number, step: number, skip?: number, maxZ = half): BufferGeometry {
  const pts: number[] = [];
  const zEnd = Math.min(half, maxZ);
  for (let v = -half; v <= half; v += step) {
    if (skip && v % skip === 0) continue;
    pts.push(v, 0, -half, v, 0, zEnd);
    if (v <= zEnd) pts.push(-half, 0, v, half, 0, v);
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pts, 3));
  return g;
}

/** A flat rectangle on the ground plane between z0 and z1, across the whole ground. */
function Band({ z0, z1, y, color }: { z0: number; z1: number; y: number; color: string }) {
  return (
    <mesh position={[0, y, (z0 + z1) / 2]} rotation-x={-Math.PI / 2}>
      <planeGeometry args={[GROUND_SIZE, z1 - z0]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

/**
 * The yard floor. The colour is drawn unlit so it always matches the palette exactly;
 * a transparent shadow catcher on top adds the soft shadows.
 * With `shoreZ`, the land ends in a straight shore at that z, with water below it beyond.
 */
export function Ground({ showGrid, shoreZ }: { showGrid: boolean; shoreZ?: number }) {
  const half = GROUND_SIZE / 2;
  const landEnd = shoreZ === undefined ? half : Math.min(half, shoreZ);
  const cells = useMemo(() => gridLines(GRID_HALF, CELL, SECTION, landEnd), [landEnd]);
  const sections = useMemo(() => gridLines(GRID_HALF, SECTION, undefined, landEnd), [landEnd]);
  return (
    <group>
      <Band z0={-half} z1={landEnd} y={0} color={palette.ground} />
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.005, (landEnd - half) / 2]} receiveShadow>
        <planeGeometry args={[GROUND_SIZE, landEnd + half]} />
        <shadowMaterial color={palette.shadow} opacity={0.22} transparent />
      </mesh>
      {shoreZ !== undefined && landEnd < half && (
        <group name="water">
          <Band z0={landEnd} z1={half + 200} y={WATER_LEVEL} color={palette.water} />
          {/* Faint swell lines parallel to the shore */}
          {[9, 23, 41, 66, 98, 140].map((d) => (
            <Band key={d} z0={landEnd + d} z1={landEnd + d + 0.6 + d / 60} y={WATER_LEVEL + 0.01} color={palette.waterLine} />
          ))}
          <mesh rotation-x={-Math.PI / 2} position={[0, WATER_LEVEL + 0.02, landEnd + 100]} receiveShadow>
            <planeGeometry args={[GROUND_SIZE, 200]} />
            <shadowMaterial color={palette.shadow} opacity={0.18} transparent />
          </mesh>
          {/* The shore wall, from the land down to the water */}
          <mesh position={[0, WATER_LEVEL / 2, landEnd]}>
            <planeGeometry args={[GROUND_SIZE, -WATER_LEVEL]} />
            <meshBasicMaterial color={palette.quayWall} />
          </mesh>
        </group>
      )}
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
