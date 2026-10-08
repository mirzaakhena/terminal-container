import { lighting } from '../config/theme';

/** Bright, low-contrast lighting: strong ambient/hemisphere fill and one soft-shadowed sun. */
export function Lights() {
  const e = lighting.shadowExtent;
  return (
    <>
      <ambientLight intensity={lighting.ambient} />
      <hemisphereLight args={[lighting.hemisphereSky, lighting.hemisphereGround, lighting.hemisphere]} />
      <directionalLight
        position={lighting.sunDirection}
        intensity={lighting.sun}
        color={lighting.sunColor}
        castShadow
        shadow-mapSize={[lighting.shadowMapSize, lighting.shadowMapSize]}
        shadow-camera-left={-e}
        shadow-camera-right={e}
        shadow-camera-top={e}
        shadow-camera-bottom={-e}
        shadow-camera-near={1}
        shadow-camera-far={400}
        shadow-bias={-0.0004}
        shadow-normalBias={0.04}
        shadow-radius={6}
      />
    </>
  );
}
