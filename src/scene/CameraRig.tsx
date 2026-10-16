import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Vector3 } from 'three';
import { dolly, orbitY, homePosition, HOME_TARGET, MIN_DISTANCE, MAX_DISTANCE, type Vec3 } from './cameraMath';
import type { CameraApiRef } from './cameraApi';
import { debugHandle } from '../lib/debug';

interface Tween {
  fromPos: Vector3;
  toPos: Vector3;
  fromTarget: Vector3;
  toTarget: Vector3;
  t: number;
}

const DURATION = 0.45; // seconds
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

export function CameraRig({ api, homeDistance, homeAzimuth = 0 }: { api: CameraApiRef; homeDistance?: number; homeAzimuth?: number }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const tween = useRef<Tween | null>(null);
  const camera = useThree((s) => s.camera);
  const homeRef = useRef({ distance: homeDistance, azimuth: homeAzimuth });

  useEffect(() => {
    const go = (pos: Vec3, target: Vec3) => {
      const c = controls.current;
      if (!c) return;
      tween.current = {
        fromPos: camera.position.clone(),
        toPos: new Vector3(...pos),
        fromTarget: c.target.clone(),
        toTarget: new Vector3(...target),
        t: 0,
      };
    };
    const current = (): [Vec3, Vec3] => {
      const c = controls.current!;
      const end = tween.current;
      const p = end ? end.toPos : camera.position;
      const t = end ? end.toTarget : c.target;
      return [p.toArray() as Vec3, t.toArray() as Vec3];
    };
    api.current = {
      zoom: (factor) => {
        const [p, t] = current();
        go(dolly(p, t, factor), t);
      },
      rotate: (angle) => {
        const [p, t] = current();
        go(orbitY(p, t, angle), t);
      },
      home: () => go(homePosition(homeRef.current.distance, homeRef.current.azimuth), HOME_TARGET),
      focus: (target, distance = 60) => {
        const [p, t] = current();
        const offset: Vec3 = [p[0] - t[0], p[1] - t[1], p[2] - t[2]];
        const len = Math.hypot(...offset);
        const k = distance / len;
        go([target[0] + offset[0] * k, target[1] + offset[1] * k, target[2] + offset[2] * k], target);
      },
    };
    if (import.meta.env.DEV) {
      debugHandle().camera = {
        position: () => camera.position.toArray(),
        target: () => controls.current?.target.toArray(),
        moving: () => !!tween.current,
        /** Glides to look at a world point from the current direction (for screenshots and tests). */
        focus: (target: Vec3, distance?: number) => api.current?.focus(target, distance),
        rotate: (angle: number) => api.current?.rotate(angle),
        /** Where a world point lands on screen, in normalised device coordinates (-1…1 across the canvas). */
        project: (p: Vec3) => {
          const v = new Vector3(...p).project(camera);
          return [v.x, v.y, v.z];
        },
      };
    }
    return () => {
      api.current = null;
    };
  }, [api, camera]);

  // A view with its own framing: jump there on first mount, glide there when the view changes.
  const first = useRef(true);
  useEffect(() => {
    homeRef.current = { distance: homeDistance, azimuth: homeAzimuth };
    if (first.current) {
      first.current = false;
      camera.position.set(...homePosition(homeDistance, homeAzimuth));
      controls.current?.update();
      return;
    }
    api.current?.home();
  }, [homeDistance, homeAzimuth, api, camera]);

  useFrame((_, dt) => {
    const tw = tween.current;
    const c = controls.current;
    if (!tw || !c) return;
    tw.t = Math.min(1, tw.t + dt / DURATION);
    const k = ease(tw.t);
    camera.position.lerpVectors(tw.fromPos, tw.toPos, k);
    c.target.lerpVectors(tw.fromTarget, tw.toTarget, k);
    c.update();
    if (tw.t >= 1) tween.current = null;
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      target={HOME_TARGET}
      enableDamping
      dampingFactor={0.08}
      minDistance={MIN_DISTANCE}
      maxDistance={MAX_DISTANCE}
      maxPolarAngle={Math.PI / 2.15}
      screenSpacePanning={false}
      onStart={() => (tween.current = null)}
    />
  );
}
