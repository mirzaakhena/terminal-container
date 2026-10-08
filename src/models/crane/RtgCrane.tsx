import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group, Mesh } from 'three';
import { CONTAINER_SPECS, Container } from '../container';
import { materials } from '../materials';
import { Slab } from '../parts';
import type { CraneController } from './controller';
import { SPREADER } from './spec';
import { FRAME, frameParts, trolleyParts } from './frame';

const { ropeDx: ROPE_DX, ropeDz: ROPE_DZ, girderH: GIRDER_H } = FRAME;

/**
 * Rubber-tyred gantry crane. Reads its pose from the controller every frame, so the scene does not
 * re-render while it moves. Positions are in the yard frame: the parent group must be the yard origin.
 */
export function RtgCrane({ crane }: { crane: CraneController }) {
  const { spec } = crane;
  const [z0, z1] = spec.legZ;
  const top = spec.girderY;
  const hw = spec.wheelbase / 2;
  const staticParts = useMemo(() => frameParts(spec), [spec]);
  const movingParts = useMemo(() => trolleyParts(spec), [spec]);

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
      {staticParts.map((b, i) => (
        <Slab key={i} from={b.from} to={b.to} material={materials[b.material]} shadow={b.material !== 'glass'} />
      ))}
      {/* Wheels: two per leg, rolling along the block */}
      {[z0, z1].flatMap((z) =>
        [-hw, hw].flatMap((x) =>
          [-0.75, 0.75].map((dx) => (
            <mesh key={`${z},${x},${dx}`} position={[x + dx, FRAME.wheelR, z]} rotation-x={Math.PI / 2} material={materials.rubber} castShadow>
              <cylinderGeometry args={[FRAME.wheelR, FRAME.wheelR, 0.55, 18]} />
            </mesh>
          )),
        ),
      )}

      {/* Trolley, its cab and everything hanging from it */}
      <group ref={trolley}>
        {movingParts.map((b, i) => (
          <Slab key={i} from={b.from} to={b.to} material={materials[b.material]} shadow={b.material !== 'glass'} />
        ))}

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
