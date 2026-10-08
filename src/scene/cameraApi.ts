import type { Vec3 } from './cameraMath';

/** Commands the UI overlay sends to the camera. Filled in by <CameraRig> once the scene is mounted. */
export interface CameraApi {
  zoom(factor: number): void;
  rotate(angle: number): void;
  home(): void;
  focus(target: Vec3, distance?: number): void;
}

export const createCameraApi = (): { current: CameraApi | null } => ({ current: null });
export type CameraApiRef = ReturnType<typeof createCameraApi>;
