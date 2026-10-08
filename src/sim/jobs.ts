import { CONTAINER_SPECS, type ContainerType } from '../models/container';
import {
  containersOnTop, formatAddress, canPlace as canPlaceInBlock, place, remove, slotPosition,
  type BlockContainer, type BlockState,
} from '../models/yard';
import { SLOTS, planLoad, type SlotId, type TrailerLoad } from '../models/truck/loads';
import { TRAILER } from '../models/truck/spec';
import { CraneController, LANE_Z } from '../models/crane';
import { createRoute, type Route } from '../motion/route';
import { TruckMotion } from '../motion/truckMotion';
import { floorUnder, solids, type ParkedTruck } from './world';

/**
 * Crane jobs between the block and trucks in the lane.
 *  - delivery:  containers leave the block on a truck that drives in empty
 *  - receiving: a loaded truck drives in and its containers go into the block
 * Jobs run one after another. Each is checked when it is added, against the block as it will be
 * once every job already queued has run, so a queue never contains a job that cannot work.
 */
export interface Address { bay: number; row: number; tier: number }

export type JobRequest =
  /** `types`, when given, is the load the truck was booked for; each container must match it. */
  | { kind: 'delivery'; from: Address[]; types?: ContainerType[] }
  | { kind: 'receiving'; types: ContainerType[]; to: Address[] };

export type JobStatus = 'queued' | 'running' | 'done' | 'failed';

export interface JobMove {
  id: string;
  type: ContainerType;
  color: number;
  slot: SlotId;
  address: Address;
}

export interface Job {
  id: string;
  kind: JobRequest['kind'];
  truckId: string;
  moves: JobMove[];
  status: JobStatus;
  /** What the job is doing right now, in plain words. */
  step: string;
  /** Index into JOB_STAGES, for progress timelines. */
  stage: number;
  error?: string;
  startedAt?: number;
  finishedAt?: number;
}

export const JOB_STAGES = ['Queued', 'Truck arriving', 'Crane working', 'Truck leaving', 'Done'] as const;

export type Refusal = { ok: false; reason: string };

// ─── The truck route: in from the gate, round two corners, along the lane, out past the block ──────

export const GATE_X = -90;
const ENTRY_Z = LANE_Z - 30;
const CORNER_X = -28;

export function laneRoute(blockLength: number): Route {
  return createRoute(
    [[GATE_X, ENTRY_Z], [CORNER_X, ENTRY_Z], [CORNER_X, LANE_Z], [blockLength + 70, LANE_Z]],
    11,
    { Gate: 0, Exit: 3 },
  );
}

/** Distance along the route at which the kingpin is at `x` on the lane straight. */
function laneStopS(route: Route, x: number): number {
  const end = route.at(route.length);
  return route.length - (end.x - x);
}

// ─── Planning: resolve and check a request against the block as it will be ────────────────────────

const pad = (n: number) => String(n).padStart(2, '0');

function containerAt(block: BlockState, a: Address): BlockContainer | undefined {
  return Object.values(block.containers).find((c) => c.bay === a.bay && c.row === a.row && c.tier === a.tier);
}

let truckSeq = 0;
let boxSeq = 0;
const newBoxId = () => `MSKU${String(700000 + ++boxSeq)}`;

/** Checks a request and works out which trailer position each container uses. Returns the planned block after it. */
export function planJob(block: BlockState, req: JobRequest):
  | { ok: true; moves: JobMove[]; after: BlockState }
  | Refusal {
  if (req.kind === 'delivery') {
    if (!req.from.length) return { ok: false, reason: 'Choose at least one container to deliver.' };
    if (req.types && req.types.length !== req.from.length) return { ok: false, reason: 'Give one block address for each container the truck is booked for.' };
    let b = block;
    const picked: BlockContainer[] = [];
    for (const a of req.from) {
      const c = containerAt(b, a);
      if (!c) return { ok: false, reason: `There is no container at ${formatAddress(a)}${picked.length ? ' by then' : ''}.` };
      const want = req.types?.[picked.length];
      if (want && CONTAINER_SPECS[want].nominalFeet !== CONTAINER_SPECS[c.type].nominalFeet) {
        return { ok: false, reason: `${c.id} at ${formatAddress(a)} is a ${CONTAINER_SPECS[c.type].label}, but this truck is booked for a ${CONTAINER_SPECS[want].nominalFeet}ft.` };
      }
      if (want && want !== c.type && CONTAINER_SPECS[want].nominalFeet === 40) {
        return { ok: false, reason: `${c.id} at ${formatAddress(a)} is a ${CONTAINER_SPECS[c.type].label}, not a ${CONTAINER_SPECS[want].label}.` };
      }
      const above = containersOnTop(b, c.id);
      if (above.length) {
        return { ok: false, reason: `${c.id} at ${formatAddress(a)} is buried under ${above.map((x) => x.id).join(', ')}; it cannot be reached.` };
      }
      const r = remove(b, c.id);
      if (!r.ok) return r;
      b = r.value;
      picked.push(c);
    }
    const load = planLoad(picked.map((c) => c.type));
    if (!load.ok) return load;
    const slots = slotOrder(load.load);
    const moves = picked.map((c, i) => ({ id: c.id, type: c.type, color: typeof c.color === 'number' ? c.color : 0, slot: slots[i], address: req.from[i] }));
    return { ok: true, moves, after: b };
  }

  if (req.types.length !== req.to.length) return { ok: false, reason: 'Give one block address for each container on the truck.' };
  if (!req.types.length) return { ok: false, reason: 'A receiving truck needs at least one container.' };
  const load = planLoad(req.types);
  if (!load.ok) return load;
  const slots = slotOrder(load.load);
  let b = block;
  const moves: JobMove[] = [];
  for (let i = 0; i < req.types.length; i++) {
    const type = req.types[i];
    const at = req.to[i];
    const check = canPlaceInBlock(b, type, at);
    if (!check.ok) return { ok: false, reason: check.reason.includes(formatAddress(at)) ? check.reason : `${formatAddress(at)}: ${check.reason}` };
    const id = newBoxId();
    const color = Math.floor(Math.random() * 8);
    const r = place(b, { id, type, color, ...at });
    if (!r.ok) return r;
    b = r.value;
    moves.push({ id, type, color, slot: slots[i], address: at });
  }
  return { ok: true, moves, after: b };
}

/** Trailer positions in the order containers go on (or come off): front before rear. */
function slotOrder(load: TrailerLoad): SlotId[] {
  const order: SlotId[] = ['full40', 'centre20', 'front20', 'rear20'];
  return order.filter((s) => load[s]);
}

// ─── Running jobs ─────────────────────────────────────────────────────────────────────────────────

type CraneOp =
  | { op: 'raise' }
  | { op: 'spreader'; feet: 20 | 40 }
  | { op: 'move'; x: number; z: number }
  | { op: 'lower' }
  | { op: 'lock' }
  | { op: 'release' };

export interface ActiveTruck {
  id: string;
  motion: TruckMotion;
  load: TrailerLoad;
  ids: Partial<Record<SlotId, string>>;
  colors: Partial<Record<SlotId, number>>;
  phase: 'arriving' | 'parked' | 'leaving';
  stopS: number;
}

/**
 * Runs queued jobs on a crane and its world. The crane's world is the single source of truth for
 * the block and parked trucks; a truck that is driving is not in the world (the crane cannot touch it)
 * and the crane is kept fully raised while any truck moves under it.
 */
export class JobRunner {
  jobs: Job[] = [];
  /** The block as it will be when every queued job has run. */
  planned: BlockState;
  truck: ActiveTruck | null = null;
  route: Route;
  time = 0;
  private ops: CraneOp[] = [];
  private opStarted = false;

  constructor(public crane: CraneController, blockLength: number) {
    this.planned = crane.world.block;
    this.route = laneRoute(blockLength);
  }

  get current(): Job | undefined {
    return this.jobs.find((j) => j.status === 'running');
  }

  get busy() {
    return this.jobs.some((j) => j.status === 'running' || j.status === 'queued');
  }

  /** Adds a job to the queue, or explains why it cannot be done. */
  add(req: JobRequest): { ok: true; job: Job } | Refusal {
    const plan = planJob(this.planned, req);
    if (!plan.ok) return plan;
    this.planned = plan.after;
    const job: Job = {
      id: `JOB-${String(this.jobs.length + 1).padStart(3, '0')}`,
      kind: req.kind,
      truckId: `TRK-${String(++truckSeq).padStart(2, '0')}`,
      moves: plan.moves,
      status: 'queued',
      step: 'Waiting for the crane',
      stage: 0,
    };
    this.jobs.push(job);
    return { ok: true, job };
  }

  step(dt: number) {
    const n = Math.max(1, Math.ceil(dt / 0.05));
    for (let i = 0; i < n; i++) this.tick(dt / n);
  }

  private tick(dt: number) {
    this.time += dt;
    this.crane.step(dt);
    if (this.truck && this.truck.phase !== 'parked') this.truck.motion.step(dt);

    let job = this.current;
    if (!job) {
      job = this.jobs.find((j) => j.status === 'queued');
      if (!job) return;
      this.start(job);
    }
    try {
      this.advance(job);
    } catch (e) {
      job.status = 'failed';
      job.error = (e as Error).message;
      job.step = `Stopped: ${job.error}`;
      this.ops = [];
    }
  }

  private start(job: Job) {
    job.status = 'running';
    job.startedAt = this.time;
    job.stage = 1;
    job.step = `${job.truckId} driving in from the gate`;
    const load: TrailerLoad = {};
    const ids: ActiveTruck['ids'] = {};
    const colors: ActiveTruck['colors'] = {};
    if (job.kind === 'receiving') {
      for (const m of job.moves) {
        load[m.slot] = m.type;
        ids[m.slot] = m.id;
        colors[m.slot] = m.color;
      }
    }
    // Park so the trailer sits beside the bays the job works on, to keep gantry travel short.
    const bayX = job.moves.map((m) => slotPosition(this.crane.world.block, m.type, { ...m.address, tier: 1 })[0]);
    const mid = (Math.min(...bayX) + Math.max(...bayX)) / 2;
    const kingpinX = mid - SLOTS.full40.centreX;
    const stopS = laneStopS(this.route, kingpinX);
    const motion = new TruckMotion(this.route);
    // Keep the crane clear of the lane before the truck drives under it.
    this.crane.moveTo('hoist', this.crane.spec.hoist.max);
    motion.driveTo(stopS);
    this.truck = { id: job.truckId, motion, load, ids, colors, phase: 'arriving', stopS };
    this.ops = [];
  }

  private advance(job: Job) {
    const t = this.truck!;
    if (t.phase === 'arriving') {
      if (t.motion.moving) return;
      // Parked: hand the truck to the world so the crane can work on it.
      const p = t.motion.pose();
      const parked: ParkedTruck = { id: t.id, x: p.x, z: p.z, load: t.load, ids: t.ids, colors: t.colors };
      this.crane.world = { ...this.crane.world, trucks: [parked] };
      t.phase = 'parked';
      job.stage = 2;
      this.ops = this.planOps(job, parked);
      this.opStarted = false;
    }
    if (t.phase === 'parked') {
      if (this.runOps(job)) return;
      // Crane finished: the truck leaves with whatever is on it now.
      const parked = this.crane.world.trucks[0];
      t.load = parked.load;
      t.ids = parked.ids;
      t.colors = parked.colors as ActiveTruck['colors'];
      this.crane.world = { ...this.crane.world, trucks: [] };
      t.phase = 'leaving';
      t.motion.driveTo('Exit');
      job.stage = 3;
      job.step = `${t.id} leaving`;
      return;
    }
    if (t.phase === 'leaving' && !t.motion.moving) {
      this.truck = null;
      job.status = 'done';
      job.stage = 4;
      job.finishedAt = this.time;
      job.step = 'Done';
    }
  }

  /** The crane's moves for a job, as a list of simple operations. */
  private planOps(job: Job, truck: ParkedTruck): CraneOp[] {
    const ops: CraneOp[] = [];
    for (const m of job.moves) {
      const feet = CONTAINER_SPECS[m.type].nominalFeet;
      const truckXZ = { x: truck.x + SLOTS[m.slot].centreX, z: truck.z };
      const blockXZ = (() => {
        const [x, , z] = slotPosition(this.crane.world.block, m.type, { ...m.address, tier: 1 });
        return { x, z };
      })();
      const [from, to] = job.kind === 'delivery' ? [blockXZ, truckXZ] : [truckXZ, blockXZ];
      ops.push(
        { op: 'raise' }, { op: 'spreader', feet }, { op: 'move', ...from }, { op: 'lower' }, { op: 'lock' },
        { op: 'raise' }, { op: 'move', ...to }, { op: 'lower' }, { op: 'release' },
      );
    }
    ops.push({ op: 'raise' });
    return ops;
  }

  /** Height the spreader must reach so it, and what it holds, clear everything in the world. */
  private travelHeight(): number {
    const top = Math.max(0, ...solids(this.crane.world).map((s) => s.top));
    const want = top + this.crane.hangingHeight + 0.8;
    return Math.min(this.crane.spec.hoist.max, want);
  }

  /** Works through the crane operations; returns true while some remain. */
  private runOps(job: Job): boolean {
    const c = this.crane;
    while (this.ops.length) {
      const op = this.ops[0];
      if (!this.opStarted) {
        this.opStarted = true;
        const box = c.carried?.id ?? job.moves.find((m) => !this.isDone(job, m))?.id ?? '';
        switch (op.op) {
          case 'raise':
            job.step = c.carried ? `Lifting ${box}` : 'Raising the spreader';
            c.moveTo('hoist', this.travelHeight());
            break;
          case 'spreader': {
            const r = c.setSpreader(op.feet);
            if (!r.ok) throw new Error(r.reason);
            job.step = `Setting the spreader to ${op.feet}ft`;
            break;
          }
          case 'move':
            job.step = c.carried ? `Carrying ${box}` : `Moving to ${box}`;
            c.moveTo('gantry', op.x);
            c.moveTo('trolley', op.z);
            break;
          case 'lower':
            job.step = c.carried ? `Setting ${box} down` : `Lowering onto ${box}`;
            c.moveTo('hoist', 0);
            break;
          case 'lock': {
            const r = c.lock();
            if (!r.ok) throw new Error(r.reason);
            job.step = `Locked on ${box}`;
            break;
          }
          case 'release': {
            const r = c.release();
            if (!r.ok) throw new Error(r.reason);
            job.step = `Released ${box}`;
            break;
          }
        }
      }
      if (c.moving) return true;
      if (c.blocked && op.op === 'move') throw new Error(c.blocked);
      this.ops.shift();
      this.opStarted = false;
    }
    return false;
  }

  private isDone(job: Job, m: JobMove): boolean {
    const inBlock = !!this.crane.world.block.containers[m.id];
    return job.kind === 'delivery' ? !inBlock : inBlock;
  }
}

/** For checks: the lowest point of whatever hangs from the crane, and the floor under it. */
export function hangingClearance(crane: CraneController): { bottom: number; floor: number } {
  const bottom = crane.hoist.pos - crane.hangingHeight;
  return { bottom, floor: floorUnder(crane.world, crane.footprint()) };
}

export const TRUCK_TOP = (load: TrailerLoad) =>
  TRAILER.deckY + Math.max(0, ...Object.values(load).map((t) => CONTAINER_SPECS[t!].height));

export { pad };

// ─── Suggestions for the job form ─────────────────────────────────────────────────────────────────

/** Containers of the wanted sizes that a delivery could take now (nothing on top), nearest the lane first. */
export function suggestDelivery(block: BlockState, types: ContainerType[], rand = Math.random): Address[] | null {
  let b = block;
  const out: Address[] = [];
  for (const type of types) {
    const feet = CONTAINER_SPECS[type].nominalFeet;
    const free = Object.values(b.containers).filter(
      (c) => CONTAINER_SPECS[c.type].nominalFeet === feet && (feet === 20 || c.type === type) && containersOnTop(b, c.id).length === 0,
    );
    if (!free.length) return null;
    const c = free[Math.floor(rand() * free.length)];
    out.push({ bay: c.bay, row: c.row, tier: c.tier });
    const r = remove(b, c.id);
    if (!r.ok) return null;
    b = r.value;
  }
  return out;
}

/** Free, supported block addresses for the given containers. */
export function suggestReceiving(block: BlockState, types: ContainerType[], rand = Math.random): Address[] | null {
  let b = block;
  const out: Address[] = [];
  const { bays, rows, tiers } = b.config;
  for (const type of types) {
    const options: Address[] = [];
    for (let bay = 1; bay <= bays * 2; bay++) {
      for (let row = 1; row <= rows; row++) {
        for (let tier = 1; tier <= tiers; tier++) {
          if (canPlaceInBlock(b, type, { bay, row, tier }).ok) options.push({ bay, row, tier });
        }
      }
    }
    // Prefer low stacks, like a yard planner would.
    const low = options.filter((o) => o.tier <= 2);
    const pool = low.length ? low : options;
    if (!pool.length) return null;
    const a = pool[Math.floor(rand() * pool.length)];
    out.push(a);
    const r = place(b, { id: `plan-${out.length}`, type, ...a });
    if (!r.ok) return null;
    b = r.value;
  }
  return out;
}
