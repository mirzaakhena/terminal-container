import { CONTAINER_SPECS } from '../container';
import { floorUnder, pickUp, setDown, type CarriedContainer, type Footprint, type World } from '../../sim/world';
import { SPEEDS, SPREADER, type CraneSpec } from './spec';

export type AxisName = 'gantry' | 'trolley' | 'hoist';
type Profile = { max: number; accel: number };

/** One crane movement: drives toward a target with limited speed and acceleration, never past its limits. */
export class Axis {
  vel = 0;
  target: number;
  constructor(public pos: number, public min: number, public max: number) {
    this.target = pos;
  }
  setTarget(v: number) {
    this.target = Math.min(this.max, Math.max(this.min, v));
  }
  /** Stop as soon as braking allows. */
  stop(profile: Profile) {
    const brake = (this.vel * this.vel) / (2 * profile.accel);
    this.setTarget(this.pos + Math.sign(this.vel) * brake);
  }
  get moving() {
    return Math.abs(this.target - this.pos) > 1e-4 || Math.abs(this.vel) > 1e-4;
  }
  /** Proposed next position for this tick (not yet committed). */
  propose(dt: number, p: Profile): { pos: number; vel: number } {
    const d = this.target - this.pos;
    if (Math.abs(d) < 1e-4 && Math.abs(this.vel) < 0.02) return { pos: this.target, vel: 0 };
    const dir = Math.sign(d);
    const brakeSpeed = Math.sqrt(2 * p.accel * Math.abs(d));
    let v = this.vel + dir * p.accel * dt;
    v = dir * Math.min(Math.abs(v), p.max, brakeSpeed);
    if (Math.sign(v) !== dir) v = dir * Math.min(p.accel * dt, brakeSpeed);
    let pos = this.pos + v * dt;
    if ((dir > 0 && pos > this.target) || (dir < 0 && pos < this.target)) pos = this.target;
    return { pos, vel: v };
  }
}

export type LockResult = { ok: true } | { ok: false; reason: string };

/**
 * The crane's state and motion. `world` is what it lifts from and sets down on; the crane keeps
 * whatever it carries itself, so a carried container is not part of the world while it hangs.
 */
export class CraneController {
  gantry: Axis;
  trolley: Axis;
  hoist: Axis;
  /** Current spreader length (m) and the length it is telescoping to. */
  spreaderLength: number = SPREADER.minLength;
  spreaderTarget: number = SPREADER.minLength;
  carried: CarriedContainer | null = null;
  /** Why the last movement stopped short, if something was in the way. */
  blocked: string | null = null;

  constructor(public spec: CraneSpec, public world: World, start?: { gantry?: number; trolley?: number; hoist?: number }) {
    this.gantry = new Axis(start?.gantry ?? spec.gantry.min + 6, spec.gantry.min, spec.gantry.max);
    this.trolley = new Axis(start?.trolley ?? spec.trolley.min, spec.trolley.min, spec.trolley.max);
    this.hoist = new Axis(start?.hoist ?? spec.hoist.max, spec.hoist.min, spec.hoist.max);
  }

  get spreaderFeet(): 20 | 40 {
    return this.spreaderTarget > (SPREADER.minLength + SPREADER.maxLength) / 2 ? 40 : 20;
  }
  get telescoping() {
    return Math.abs(this.spreaderLength - this.spreaderTarget) > 1e-4;
  }
  get moving() {
    return this.gantry.moving || this.trolley.moving || this.hoist.moving || this.telescoping;
  }

  profile(axis: AxisName): Profile {
    if (axis === 'hoist') return this.carried ? SPEEDS.hoistLoaded : SPEEDS.hoistEmpty;
    return SPEEDS[axis];
  }

  axis(name: AxisName): Axis {
    return this[name];
  }

  moveTo(name: AxisName, value: number) {
    this.blocked = null;
    this.axis(name).setTarget(value);
  }

  /** Start moving one axis toward its limit in a direction (for hold-to-move controls). */
  jog(name: AxisName, dir: -1 | 1) {
    this.blocked = null;
    const a = this.axis(name);
    a.setTarget(dir > 0 ? a.max : a.min);
  }

  stop(name: AxisName) {
    this.axis(name).stop(this.profile(name));
  }

  setSpreader(feet: 20 | 40): LockResult {
    if (this.carried) return { ok: false, reason: 'The spreader cannot change length while it holds a container.' };
    this.spreaderTarget = feet === 40 ? SPREADER.maxLength : SPREADER.minLength;
    return { ok: true };
  }

  /** What hangs below the spreader's underside: the carried container, if any. */
  get hangingHeight() {
    return this.carried ? CONTAINER_SPECS[this.carried.type].height : 0;
  }

  /** Footprint of the spreader (or of the container it carries) at a gantry/trolley position. */
  footprint(x = this.gantry.pos, z = this.trolley.pos): Footprint {
    const len = this.carried ? CONTAINER_SPECS[this.carried.type].length : this.spreaderLength;
    return { x, z, hx: len / 2, hz: SPREADER.width / 2 };
  }

  /** Lowest the spreader underside may go here without anything below passing into what is underneath. */
  lowestHoist(x = this.gantry.pos, z = this.trolley.pos) {
    return Math.max(this.spec.hoist.min, floorUnder(this.world, this.footprint(x, z)) + this.hangingHeight);
  }

  lock(): LockResult {
    if (this.carried) return { ok: false, reason: 'The spreader is already holding a container.' };
    if (this.moving) return { ok: false, reason: 'Wait for the crane to stop before locking.' };
    const r = pickUp(this.world, this.gantry.pos, this.trolley.pos, this.hoist.pos, this.spreaderFeet);
    if (!r.ok) return r;
    if (Math.abs(this.spreaderLength - CONTAINER_SPECS[r.value.container.type].length) > 0.01) {
      return { ok: false, reason: 'The spreader has not finished changing length.' };
    }
    this.world = r.value.world;
    this.carried = r.value.container;
    return { ok: true };
  }

  release(): LockResult {
    if (!this.carried) return { ok: false, reason: 'The spreader is not holding anything.' };
    if (this.moving) return { ok: false, reason: 'Wait for the crane to stop before releasing.' };
    const bottom = this.hoist.pos - this.hangingHeight;
    const r = setDown(this.world, this.carried, this.gantry.pos, this.trolley.pos, bottom);
    if (!r.ok) return r;
    this.world = r.value;
    this.carried = null;
    return { ok: true };
  }

  step(dt: number) {
    const n = Math.max(1, Math.ceil(dt / 0.02));
    for (let i = 0; i < n; i++) this.tick(dt / n);
  }

  private tick(dt: number) {
    // Spreader telescoping
    if (this.telescoping) {
      const d = this.spreaderTarget - this.spreaderLength;
      const stepLen = Math.sign(d) * Math.min(Math.abs(d), SPREADER.telescopeSpeed * dt);
      const next = this.spreaderLength + stepLen;
      const fp = { ...this.footprint(), hx: next / 2 };
      if (this.hoist.pos < floorUnder(this.world, fp) - 1e-6) {
        this.blocked = 'The spreader cannot extend here: it would hit a container.';
        this.spreaderTarget = this.spreaderLength;
      } else this.spreaderLength = next;
    }

    // Hoist: never below what is underneath.
    const hp = this.hoist.propose(dt, this.profile('hoist'));
    const floor = this.lowestHoist();
    if (hp.pos < floor - 1e-6) {
      // Land exactly on the surface below.
      this.hoist.pos = Math.min(floor, this.spec.hoist.max);
      this.hoist.vel = 0;
      this.hoist.target = this.hoist.pos;
      if (hp.vel < 0) this.blocked = this.carried ? 'Set down: the container is resting on what is below.' : 'The spreader has landed.';
    } else {
      this.hoist.pos = hp.pos;
      this.hoist.vel = hp.vel;
    }

    // Gantry and trolley: never drive the spreader or its load into a stack.
    for (const name of ['gantry', 'trolley'] as const) {
      const a = this.axis(name);
      const p = a.propose(dt, this.profile(name));
      const x = name === 'gantry' ? p.pos : this.gantry.pos;
      const z = name === 'trolley' ? p.pos : this.trolley.pos;
      if (this.hoist.pos < this.lowestHoist(x, z) - 1e-6) {
        a.vel = 0;
        a.target = a.pos;
        this.blocked = 'Raise the spreader first: something is in the way.';
      } else {
        a.pos = p.pos;
        a.vel = p.vel;
      }
    }
  }
}
