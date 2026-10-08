import { describe, expect, it } from 'vitest';
import { dolly, orbitY, length, HOME_POSITION, HOME_TARGET, MIN_DISTANCE, MAX_DISTANCE, type Vec3 } from './cameraMath';

const dist = (p: Vec3) => length([p[0] - HOME_TARGET[0], p[1] - HOME_TARGET[1], p[2] - HOME_TARGET[2]]);

describe('camera math', () => {
  it('home view looks down at roughly 35 degrees', () => {
    const [x, y, z] = HOME_POSITION;
    const elevation = (Math.atan2(y, Math.hypot(x, z)) * 180) / Math.PI;
    expect(elevation).toBeGreaterThan(30);
    expect(elevation).toBeLessThan(40);
  });

  it('dolly scales distance and keeps direction', () => {
    const p = dolly(HOME_POSITION, HOME_TARGET, 0.5);
    expect(dist(p)).toBeCloseTo(dist(HOME_POSITION) * 0.5, 6);
    expect(p[0] / p[1]).toBeCloseTo(HOME_POSITION[0] / HOME_POSITION[1], 6);
  });

  it('dolly is clamped', () => {
    expect(dist(dolly(HOME_POSITION, HOME_TARGET, 0.001))).toBeCloseTo(MIN_DISTANCE, 6);
    expect(dist(dolly(HOME_POSITION, HOME_TARGET, 1000))).toBeCloseTo(MAX_DISTANCE, 6);
  });

  it('orbit keeps height and distance', () => {
    const p = orbitY(HOME_POSITION, HOME_TARGET, Math.PI / 4);
    expect(p[1]).toBeCloseTo(HOME_POSITION[1], 6);
    expect(dist(p)).toBeCloseTo(dist(HOME_POSITION), 6);
  });

  it('four quarter turns come back home', () => {
    let p = HOME_POSITION;
    for (let i = 0; i < 4; i++) p = orbitY(p, HOME_TARGET, Math.PI / 2);
    p.forEach((v, i) => expect(v).toBeCloseTo(HOME_POSITION[i], 6));
  });
});

import { homePosition } from './cameraMath';

describe('home position', () => {
  it('scales the home view to the requested distance, same direction', () => {
    const p = homePosition(120);
    expect(length(p)).toBeCloseTo(120, 6);
    expect(p[0] / p[1]).toBeCloseTo(HOME_POSITION[0] / HOME_POSITION[1], 6);
    expect(homePosition()).toBe(HOME_POSITION);
  });
});
