import { describe, expect, it } from 'vitest';
import { feet, mm } from './units';

describe('units', () => {
  it('converts feet and inches to metres', () => {
    expect(mm(feet(20))).toBe(6.096);
    expect(mm(feet(8, 6))).toBe(2.591);
  });
});
