import { Html } from '@react-three/drei';
import { palette } from '../config/theme';

/** A 10 m bar with 1 m ticks lying on the ground, so the viewer can judge real sizes. */
export function ScaleRuler({ position = [0, 0, 0] as [number, number, number], length = 10 }) {
  const ticks = Array.from({ length: length + 1 }, (_, i) => i);
  return (
    <group name="scale-ruler" position={position}>
      <mesh position={[length / 2, 0.03, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, 0.04, 0.35]} />
        <meshStandardMaterial color={palette.brand} />
      </mesh>
      {ticks.map((i) => (
        <mesh key={i} position={[i, 0.06, 0]}>
          <boxGeometry args={[0.06, 0.04, i % 5 === 0 ? 0.9 : 0.55]} />
          <meshStandardMaterial color={palette.brandDark} />
        </mesh>
      ))}
      <Html position={[length / 2, 0.1, 1.2]} center className="scene-label" zIndexRange={[10, 0]}>
        {length} m
      </Html>
    </group>
  );
}
