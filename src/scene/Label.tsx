import { Html } from '@react-three/drei';
import type { ReactNode } from 'react';

interface Props {
  position: [number, number, number];
  title: ReactNode;
  detail?: ReactNode;
}

/** A small floating tag anchored to a point in the scene. */
export function Label({ position, title, detail }: Props) {
  return (
    <Html position={position} center zIndexRange={[10, 0]}>
      <div className="scene-tag">
        <strong>{title}</strong>
        {detail && <span>{detail}</span>}
      </div>
    </Html>
  );
}
