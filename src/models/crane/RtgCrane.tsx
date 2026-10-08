import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group, Mesh } from 'three';
import { CONTAINER_SPECS, Container } from '../container';
import { materials } from '../materials';
import { Slab } from '../parts';
import type { CraneController } from './controller';
import { SPREADER } from './spec';

const LEG = 0.9;
const GIRDER_H = 1.3;
const SILL_Y = 0.75;
const WHEEL_R = 0.62;
const TROLLEY = { x: 4.6, z: 3.4, h: 1.5 };
const GIRDER_X = 1.9;
const ROPE_DX = 0.9;
const ROPE_DZ = 0.8;

/**
 * Rubber-tyred gantry crane. Reads its pose from the controller every frame, so the scene does not
 * re-render while it moves. Positions are in the yard frame: the parent group must be the yard origin.
 */
export function RtgCrane({ crane }: { crane: CraneController }) {
  const { spec } = crane;
  const [z0, z1] = spec.legZ;
  const top = spec.girderY;
  const hw = spec.wheelbase / 2;

  const gantry = useRef<Group>(null);
  const trolley = useRef<Group>(null);
  const hook = useRef<Group>(null);
  const ropes = useRef<Group>(null);
  const armL = useRef<Mesh>(null);
  const armR = useRef<Mesh>(null);
  const endL = useRef<Group>(null);
  const endR = useRef<Group>(null);
  const load = useRef<Group>(null);

  useFrame(() => {
    gantry.current?.position.set(crane.gantry.pos, 0, 0);
    trolley.current?.position.set(0, 0, crane.trolley.pos);
    const y = crane.hoist.pos;
    hook.current?.position.set(0, y, 0);
    // Ropes run from the trolley underside down to the headblock.
    const ropeTop = top + GIRDER_H;
    const ropeBottom = y + SPREADER.height + SPREADER.headblock;
    if (ropes.current) {
      ropes.current.position.y = (ropeTop + ropeBottom) / 2;
      ropes.current.scale.y = Math.max(0.01, ropeTop - ropeBottom);
    }
    // Telescopic arms: ends slide out from the fixed centre section.
    const half = crane.spreaderLength / 2;
    endL.current?.position.set(-half, 0, 0);
    endR.current?.position.set(half, 0, 0);
    for (const arm of [armL.current, armR.current]) {
      if (!arm) continue;
      arm.scale.x = half;
    }
    if (armL.current) armL.current.position.x = -half / 2;
    if (armR.current) armR.current.position.x = half / 2;
    if (load.current) load.current.visible = !!crane.carried;
  });

  const carried = crane.carried;

  return (
    <group ref={gantry}>
      {/* Two side frames: sill beam with wheel bogies, two legs, portal beam on top */}
      {[z0, z1].map((z) => (
        <group key={z}>
          <Slab from={[-hw - 1.2, SILL_Y, z - 0.55]} to={[hw + 1.2, SILL_Y + 0.9, z + 0.55]} material={materials.white} />
          {[-hw, hw].map((x) => (
            <group key={x}>
              <Slab from={[x - LEG / 2, SILL_Y + 0.9, z - LEG / 2]} to={[x + LEG / 2, top + GIRDER_H, z + LEG / 2]} material={materials.white} />
              {[-0.75, 0.75].map((dx) => (
                <mesh key={dx} position={[x + dx, WHEEL_R, z]} rotation-x={Math.PI / 2} material={materials.rubber} castShadow>
                  <cylinderGeometry args={[WHEEL_R, WHEEL_R, 0.55, 18]} />
                </mesh>
              ))}
              <Slab from={[x - 1.3, WHEEL_R + 0.1, z - 0.4]} to={[x + 1.3, SILL_Y + 0.05, z + 0.4]} material={materials.frame} />
            </group>
          ))}
          <Slab from={[-hw - 0.6, top, z - 0.6]} to={[hw + 0.6, top + GIRDER_H, z + 0.6]} material={materials.brand} />
          {/* Mid-height tie between the legs */}
          <Slab from={[-hw, top * 0.45, z - 0.3]} to={[hw, top * 0.45 + 0.5, z + 0.3]} material={materials.white} />
          {/* Warning stripes at the leg feet */}
          {[-hw, hw].map((x) => (
            <Slab key={x} from={[x - LEG / 2 - 0.01, SILL_Y + 0.9, z - LEG / 2 - 0.01]} to={[x + LEG / 2 + 0.01, SILL_Y + 1.5, z + LEG / 2 + 0.01]} material={materials.amber} />
          ))}
        </group>
      ))}

      {/* Main girders across the block, carrying the trolley */}
      {[-GIRDER_X, GIRDER_X].map((x) => (
        <Slab key={x} from={[x - 0.35, top, z0 - 0.6]} to={[x + 0.35, top + GIRDER_H, z1 + 0.6]} material={materials.brand} />
      ))}
      {/* Rails on the girders */}
      {[-GIRDER_X, GIRDER_X].map((x) => (
        <Slab key={x} from={[x - 0.08, top + GIRDER_H, z0 - 0.4]} to={[x + 0.08, top + GIRDER_H + 0.08, z1 + 0.4]} material={materials.steelDark} />
      ))}

      {/* Power house on the far sill */}
      <Slab from={[-2.2, SILL_Y + 0.9, z1 - 0.5]} to={[1.8, SILL_Y + 3.0, z1 + 0.55]} material={materials.white} />
      <Slab from={[-2.0, SILL_Y + 1.4, z1 + 0.55]} to={[1.6, SILL_Y + 2.6, z1 + 0.57]} material={materials.steelDark} />

      {/* Trolley, its cab and everything hanging from it */}
      <group ref={trolley}>
        <Slab from={[-TROLLEY.x / 2, top + GIRDER_H + 0.08, -TROLLEY.z / 2]} to={[TROLLEY.x / 2, top + GIRDER_H + 0.08 + TROLLEY.h, TROLLEY.z / 2]} material={materials.white} />
        <Slab from={[-TROLLEY.x / 2 - 0.01, top + GIRDER_H + 0.5, -TROLLEY.z / 2 - 0.01]} to={[TROLLEY.x / 2 + 0.01, top + GIRDER_H + 0.75, TROLLEY.z / 2 + 0.01]} material={materials.brand} />
        {/* Operator cab hangs on the lane side so the driver looks down onto trucks */}
        <group position={[GIRDER_X + 0.4, top - 1.0, -1.1]}>
          <Slab from={[0, -1.2, -0.9]} to={[1.9, 1.0, 0.9]} material={materials.white} />
          <Slab from={[0.2, -1.0, -0.91]} to={[1.7, 0.6, -0.89]} material={materials.glass} shadow={false} />
          <Slab from={[1.89, -1.0, -0.7]} to={[1.91, 0.6, 0.7]} material={materials.glass} shadow={false} />
          <Slab from={[0.2, -1.21, -0.7]} to={[1.7, -1.19, 0.7]} material={materials.glass} shadow={false} />
        </group>

        <group ref={ropes}>
          {[-ROPE_DX, ROPE_DX].flatMap((x) =>
            [-ROPE_DZ, ROPE_DZ].map((z) => (
              <mesh key={`${x},${z}`} position={[x, 0, z]} material={materials.steelDark}>
                <cylinderGeometry args={[0.035, 0.035, 1, 6]} />
              </mesh>
            )),
          )}
        </group>

        <group ref={hook}>
          {/* Headblock */}
          <Slab from={[-1.3, SPREADER.height, -1.1]} to={[1.3, SPREADER.height + SPREADER.headblock, 1.1]} material={materials.yellow} />
          {/* Spreader centre section and telescopic arms */}
          <Slab from={[-SPREADER.minLength / 2 + 0.3, 0.05, -0.45]} to={[SPREADER.minLength / 2 - 0.3, SPREADER.height, 0.45]} material={materials.yellow} />
          {[armL, armR].map((ref, i) => (
            <mesh key={i} ref={ref} position={[0, SPREADER.height / 2, 0]} material={materials.amber} castShadow>
              <boxGeometry args={[1, 0.3, 0.6]} />
            </mesh>
          ))}
          {[endL, endR].map((ref, i) => (
            <group key={i} ref={ref}>
              <Slab from={[-0.18, 0.02, -SPREADER.width / 2]} to={[0.18, SPREADER.height, SPREADER.width / 2]} material={materials.yellow} />
              {[-1, 1].map((s) => (
                <Slab key={s} from={[-0.1, -0.06, s * (SPREADER.width / 2 - 0.08) - 0.06]} to={[0.1, 0.02, s * (SPREADER.width / 2 - 0.08) + 0.06]} material={materials.frame} shadow={false} />
              ))}
            </group>
          ))}
          <group ref={load}>
            {carried && (
              <Container type={carried.type} color={carried.color ?? 0} position={[0, -CONTAINER_SPECS[carried.type].height, 0]} />
            )}
          </group>
        </group>
      </group>
    </group>
  );
}
