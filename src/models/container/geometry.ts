import { BoxGeometry, BufferGeometry, Float32BufferAttribute } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { CASTING, CONTAINER_SPECS, type ContainerType } from './spec';

/**
 * Builds each container as two merged meshes so a yard full of them stays cheap to draw:
 *  - body: panels, ribs, rails and posts; tinted by the container colour, darker parts via vertex shade
 *  - trim: corner castings and door hardware; one shared neutral material
 */

const RIB_DEPTH = 0.035;
const RAIL = 0.11;
const POST = 0.14;

function box(w: number, h: number, d: number, x: number, y: number, z: number, shade = 1): BufferGeometry {
  const g = new BoxGeometry(w, h, d);
  g.translate(x, y, z);
  const n = g.getAttribute('position').count;
  g.setAttribute('color', new Float32BufferAttribute(new Array(n * 3).fill(shade), 3));
  return g;
}

function buildBody(type: ContainerType): BufferGeometry {
  const { length: L, width: W, height: H } = CONTAINER_SPECS[type];
  const parts: BufferGeometry[] = [];
  const innerL = L - 2 * POST;

  // Main shell, inset by the rib depth so ribs and rails stand proud of it.
  parts.push(box(L - 0.02, H - 0.02, W - 2 * RIB_DEPTH, 0, H / 2, 0, 1));

  // Corrugation: vertical ribs on both long sides.
  const pitch = 0.28;
  const ribs = Math.floor(innerL / pitch);
  const start = -((ribs - 1) * pitch) / 2;
  for (let i = 0; i < ribs; i++) {
    const x = start + i * pitch;
    for (const side of [-1, 1]) {
      parts.push(box(0.13, H - 2 * RAIL, RIB_DEPTH, x, H / 2, side * (W / 2 - RIB_DEPTH / 2), 0.9));
    }
  }

  // Roof panel ribs (shallow), visible from the isometric camera.
  const roofRibs = Math.floor(innerL / 0.6);
  const roofStart = -((roofRibs - 1) * 0.6) / 2;
  for (let i = 0; i < roofRibs; i++) {
    parts.push(box(0.22, 0.02, W - 0.2, roofStart + i * 0.6, H - 0.005, 0, 0.94));
  }

  // Top and bottom side rails.
  for (const side of [-1, 1]) {
    const z = side * (W / 2 - RIB_DEPTH);
    parts.push(box(L, RAIL, RIB_DEPTH * 2, 0, H - RAIL / 2, z, 0.8));
    parts.push(box(L, RAIL, RIB_DEPTH * 2, 0, RAIL / 2, z, 0.72));
  }
  // End rails (top/bottom) at both ends.
  for (const end of [-1, 1]) {
    const x = end * (L / 2 - RIB_DEPTH);
    parts.push(box(RIB_DEPTH * 2, RAIL, W, x, H - RAIL / 2, 0, 0.8));
    parts.push(box(RIB_DEPTH * 2, RAIL, W, x, RAIL / 2, 0, 0.72));
  }

  // Corner posts.
  for (const ex of [-1, 1]) {
    for (const ez of [-1, 1]) {
      parts.push(box(POST, H, POST, ex * (L / 2 - POST / 2), H / 2, ez * (W / 2 - POST / 2), 0.82));
    }
  }

  // Door end (+X): two door leaves standing slightly proud, with a vertical seam between them.
  const doorH = H - 2 * RAIL;
  const leafW = (W - 2 * POST) / 2 - 0.01;
  for (const side of [-1, 1]) {
    parts.push(box(0.03, doorH, leafW, L / 2 - 0.07, H / 2, side * (leafW / 2 + 0.01), 0.96));
  }
  // Blind end (-X): corrugated front wall.
  for (let i = 0; i < 6; i++) {
    const z = -W / 2 + POST + 0.17 + i * ((W - 2 * POST - 0.34) / 5);
    parts.push(box(0.03, H - 2 * RAIL, 0.12, -L / 2 + 0.02, H / 2, z, 0.9));
  }

  const g = mergeGeometries(parts);
  parts.forEach((p) => p.dispose());
  return g;
}

function buildTrim(type: ContainerType): BufferGeometry {
  const { length: L, width: W, height: H } = CONTAINER_SPECS[type];
  const parts: BufferGeometry[] = [];
  const e = 0.004; // castings sit a hair proud so they read as separate pieces

  for (const ex of [-1, 1]) {
    for (const ez of [-1, 1]) {
      for (const top of [false, true]) {
        parts.push(
          box(
            CASTING.length + e,
            CASTING.height + e,
            CASTING.width + e,
            ex * (L / 2 - CASTING.length / 2),
            top ? H - CASTING.height / 2 : CASTING.height / 2,
            ez * (W / 2 - CASTING.width / 2),
          ),
        );
      }
    }
  }

  // Door hardware: four vertical lock rods, with handles and hinges, kept inside the ISO length.
  const doorX = L / 2 - 0.03;
  const rodZ = [-0.85, -0.35, 0.35, 0.85].map((f) => f * (W / 2 - POST));
  for (const z of rodZ) {
    parts.push(box(0.04, H - 2 * RAIL - 0.05, 0.035, doorX, H / 2, z));
    parts.push(box(0.05, 0.05, 0.16, doorX, H * 0.42, z + 0.06));
  }
  for (const side of [-1, 1]) {
    for (const f of [0.18, 0.4, 0.62, 0.84]) {
      parts.push(box(0.05, 0.08, 0.09, doorX - 0.01, f * H, side * (W / 2 - POST - 0.02)));
    }
  }

  const g = mergeGeometries(parts);
  parts.forEach((p) => p.dispose());
  return g;
}

const cache = new Map<ContainerType, { body: BufferGeometry; trim: BufferGeometry }>();

/** Shared, cached geometry for a container type. Do not dispose: every instance of that type uses it. */
export function containerGeometry(type: ContainerType) {
  let g = cache.get(type);
  if (!g) {
    g = { body: buildBody(type), trim: buildTrim(type) };
    cache.set(type, g);
  }
  return g;
}
