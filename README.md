# PortTrack

A 3D digital twin of a container terminal yard, built with React, Three.js and
React Three Fiber. The visual style follows `docs/style-reference.png`.

## Running

Requires Node.js 20 or newer.

```bash
npm install
npm run dev        # opens on http://localhost:5173
```

The view in the header can also be chosen with `?view=<id>` in the address.

### Camera

- Drag with the left mouse button to rotate, right button to pan, scroll to zoom.
- The buttons on the right edge zoom, rotate by 45°, return to the home view,
  and show or hide the 10 m reference grid and ruler.

## Checks

```bash
npm run build && npm test
```

`build` type-checks and bundles the app; `test` runs the unit tests (Vitest).

## Conventions

- One world unit is one metre. Imperial sizes go through `src/config/units.ts`.
- Colours and lighting live in `src/config/theme.ts`; everything is built from
  simple shapes in code, no external 3D files.
- Work is tracked as tickets in `.kerjaan/`.

## Development aids

While running `npm run dev`, `window.__porttrack` in the browser console reaches the live simulations:

- `__porttrack.yard.runner` — the yard's job runner (`jobs`, `crane`, `truck`, `add(...)`); `__porttrack.yard.bump()` redraws.
- `__porttrack.crane.controller` — the crane in the Crane view (`moveTo`, `jog`, `lock`, `release`, `setSpreader`); `__porttrack.crane.bump()` redraws.

It is not present in production builds.
