import type { GroupProps } from '@react-three/fiber';
import { Tractor } from './Tractor';
import { Trailer, type TrailerProps } from './Trailer';

export interface TruckProps extends GroupProps {
  load?: TrailerProps['load'];
  colors?: TrailerProps['colors'];
  /** Trailer angle relative to the tractor about the kingpin, radians (positive = trailer swings to +Z). */
  articulation?: number;
}

/** Tractor coupled to a skeletal trailer. Origin: ground below the kingpin, facing +X. */
export function Truck({ load, colors, articulation = 0, ...props }: TruckProps) {
  return (
    <group {...props}>
      <Tractor />
      <Trailer load={load} colors={colors} rotation-y={-articulation} />
    </group>
  );
}
