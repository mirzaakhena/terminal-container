import { describe, expect, it } from 'vitest';
import { Box3, Mesh } from 'three';
import { feet } from '../../config/units';
import { CONTAINER_SPECS, CONTAINER_TYPES, TWENTY_PAIR_GAP, fittingCentres } from './spec';
import { containerGeometry } from './geometry';

const CM = 0.01;

describe('container dimensions (ISO 668)', () => {
  it.each([
    ['20GP', feet(19, 10.5), feet(8), feet(8, 6)],
    ['40GP', feet(40), feet(8), feet(8, 6)],
    ['40HC', feet(40), feet(8), feet(9, 6)],
  ] as const)('%s matches the ISO size within 1 cm', (type, l, w, h) => {
    const s = CONTAINER_SPECS[type];
    expect(Math.abs(s.length - l)).toBeLessThan(CM);
    expect(Math.abs(s.width - w)).toBeLessThan(CM);
    expect(Math.abs(s.height - h)).toBeLessThan(CM);
  });

  it('two 20ft containers with the standard gap are exactly one 40ft long', () => {
    const pair = 2 * CONTAINER_SPECS['20GP'].length + TWENTY_PAIR_GAP;
    expect(pair).toBeCloseTo(CONTAINER_SPECS['40GP'].length, 3);
  });

  it('High Cube is one foot taller than standard', () => {
    expect(CONTAINER_SPECS['40HC'].height - CONTAINER_SPECS['40GP'].height).toBeCloseTo(feet(1), 2);
  });

  it('outer fittings of a 20ft pair line up with a 40ft container within 5 mm', () => {
    const offset = (CONTAINER_SPECS['20GP'].length + TWENTY_PAIR_GAP) / 2;
    const outer = offset + CONTAINER_SPECS['20GP'].fittingSpanLength / 2;
    const forty = Math.max(...fittingCentres('40GP').map(([x]) => x));
    expect(Math.abs(outer - forty)).toBeLessThan(0.005);
  });
});

describe('container geometry', () => {
  it.each(CONTAINER_TYPES)('%s model fits its ISO box within 1 cm', (type) => {
    const s = CONTAINER_SPECS[type];
    const { body, trim } = containerGeometry(type);
    const box = new Box3().setFromObject(new Mesh(body)).union(new Box3().setFromObject(new Mesh(trim)));
    expect(Math.abs(box.max.x - box.min.x - s.length)).toBeLessThan(CM);
    expect(Math.abs(box.max.z - box.min.z - s.width)).toBeLessThan(CM);
    expect(Math.abs(box.max.y - s.height)).toBeLessThan(CM);
    expect(Math.abs(box.min.y)).toBeLessThan(CM);
    expect(Math.abs(box.max.x + box.min.x)).toBeLessThan(CM); // centred along its length
  });

  it('geometry is cached per type', () => {
    expect(containerGeometry('20GP')).toBe(containerGeometry('20GP'));
  });
});
