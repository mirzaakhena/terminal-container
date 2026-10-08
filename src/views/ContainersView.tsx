import { containerColors } from '../config/theme';
import { Label } from '../scene/Label';
import { CONTAINER_SPECS, CONTAINER_TYPES, Container, TWENTY_PAIR_GAP, describeSize } from '../models/container';

const ROW_GAP = 6;
const twenty = CONTAINER_SPECS['20GP'];
const pairOffset = (twenty.length + TWENTY_PAIR_GAP) / 2;

/** Showroom of the three container types, a length comparison and the colour palette. */
export function ContainersView() {
  return (
    <group position={[2, 0, -10]}>
      {/* The three types side by side. */}
      {CONTAINER_TYPES.map((type, i) => {
        const s = CONTAINER_SPECS[type];
        const z = i * ROW_GAP;
        return (
          <group key={type}>
            <Container type={type} color={i} position={[0, 0, z]} />
            <Label position={[0, s.height + 0.9, z]} title={s.label} detail={describeSize(type)} />
          </group>
        );
      })}

      {/* Two 20ft end to end next to one 40ft: same overall length. */}
      <group position={[0, 0, 3 * ROW_GAP]}>
        <Container type="20GP" color={3} position={[-pairOffset, 0, 0]} />
        <Container type="20GP" color={5} position={[pairOffset, 0, 0]} />
        <Container type="40GP" color={6} position={[0, 0, 3.6]} />
        <Label
          position={[0, twenty.height + 0.9, 0]}
          title="2 × 20ft = 1 × 40ft"
          detail={`${(2 * twenty.length + TWENTY_PAIR_GAP).toFixed(3)} m incl. ${TWENTY_PAIR_GAP * 1000} mm gap`}
        />
      </group>

      {/* Colour palette, one 20ft per colour. */}
      <group position={[-13, 0, 0]}>
        {containerColors.map((c, i) => (
          <Container key={c} type="20GP" color={c} position={[0, 0, i * 3.2]} />
        ))}
        <Label position={[0, twenty.height + 0.9, -2]} title="Palette" detail={`${containerColors.length} colours`} />
      </group>
    </group>
  );
}
