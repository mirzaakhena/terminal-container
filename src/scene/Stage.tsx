import type { ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { PCFSoftShadowMap } from 'three';
import { palette } from '../config/theme';
import { HOME_POSITION } from './cameraMath';
import { CameraRig } from './CameraRig';
import type { CameraApiRef } from './cameraApi';
import { Ground } from './Ground';
import { Lights } from './Lights';
import { ScaleRuler } from './ScaleRuler';

interface StageProps {
  cameraApi: CameraApiRef;
  showGrid: boolean;
  children?: ReactNode;
}

/** The 3D world every view is drawn into: camera, lights, ground and scale aids. */
export function Stage({ cameraApi, showGrid, children }: StageProps) {
  return (
    <Canvas
      shadows={{ type: PCFSoftShadowMap }}
      flat
      dpr={[1, 2]}
      camera={{ position: HOME_POSITION, fov: 28, near: 0.5, far: 2000 }}
    >
      <color attach="background" args={[palette.background]} />
      <fog attach="fog" args={[palette.background, 260, 620]} />
      <Lights />
      <Ground showGrid={showGrid} />
      {showGrid && <ScaleRuler position={[-5, 0, 26]} />}
      <CameraRig api={cameraApi} />
      {children}
    </Canvas>
  );
}
