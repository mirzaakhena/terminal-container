import type { ReactNode } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { debugHandle } from '../lib/debug';
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
  /** Home-view distance for the current view; the camera moves there when it changes. */
  homeDistance?: number;
  /** Turns the home view about the vertical axis, radians. */
  homeAzimuth?: number;
  /** World z where the land ends in a shore, with water beyond (views with a quayside). */
  shoreZ?: number;
  children?: ReactNode;
}

/** Development aid: lets browser tests look into the scene (for example, whether the grid is shown). */
function ExposeScene() {
  const scene = useThree((s) => s.scene);
  if (import.meta.env.DEV) debugHandle().scene = scene;
  return null;
}

/** The 3D world every view is drawn into: camera, lights, ground and scale aids. */
export function Stage({ cameraApi, showGrid, homeDistance, homeAzimuth, shoreZ, children }: StageProps) {
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
      <Ground showGrid={showGrid} shoreZ={shoreZ} />
      {showGrid && <ScaleRuler position={[-5, 0, 26]} />}
      <ExposeScene />
      <CameraRig api={cameraApi} homeDistance={homeDistance} homeAzimuth={homeAzimuth} />
      {children}
    </Canvas>
  );
}
