import { useMemo } from 'react';
import type { GroupProps } from '@react-three/fiber';
import { MeshStandardMaterial } from 'three';
import { containerColors, palette } from '../../config/theme';
import { containerGeometry } from './geometry';
import type { ContainerType } from './spec';

const bodyMaterials = new Map<string, MeshStandardMaterial>();
const bodyMaterial = (color: string) => {
  let m = bodyMaterials.get(color);
  if (!m) {
    m = new MeshStandardMaterial({ color, vertexColors: true, roughness: 0.75, metalness: 0.05 });
    bodyMaterials.set(color, m);
  }
  return m;
};
const trimMaterial = new MeshStandardMaterial({ color: palette.steelDark, roughness: 0.6, metalness: 0.2 });

export interface ContainerProps extends GroupProps {
  type: ContainerType;
  /** Any CSS colour, or an index into the pastel container palette. */
  color?: string | number;
}

/** One shipping container, floor centred on the group origin, doors facing +X. */
export function Container({ type, color = 0, ...group }: ContainerProps) {
  const { body, trim } = containerGeometry(type);
  const hex = typeof color === 'number' ? containerColors[color % containerColors.length] : color;
  const material = useMemo(() => bodyMaterial(hex), [hex]);
  return (
    <group {...group}>
      <mesh geometry={body} material={material} castShadow receiveShadow />
      <mesh geometry={trim} material={trimMaterial} castShadow />
    </group>
  );
}
