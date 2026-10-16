---
type: feature
priority: high
review:
labels: [quay-crane, model]
reporter: mirza
assign_to: claude
created: 2026-10-16 17:09:50
updated: 2026-10-16 17:47:08
related: [261016170901, 261008104606]
blocked_by: [261016170901, 261016170902]
---

## Background
A quay crane (also called ship-to-shore or STS crane) lifts containers
between a ship and the quay. It stands on rails along the quay and can drive
along it; a long boom reaches out over the ship, and a trolley runs along the
boom from far out over the ship's outermost row, back over the apron lanes
between the crane's legs, and on to the strip behind the landside legs (the
backreach), where hatch covers will later be set down. A hoist lowers the spreader (the lifting
frame) that locks onto containers, as on the yard crane. When a ship arrives
or leaves, the boom is raised upright so it does not hit the ship.

## Request
A quay crane model in the scene's style, standing on rails along the quay,
sized to reach across the ship's rows, over the apron lanes between its legs
and into the backreach behind them, whose
gantry, trolley and hoist move within realistic limits, with a raisable boom
and a telescopic spreader that can lock onto and release containers.

## Done when
- [ ] A quay crane stands on the quay with its legs on rails either side of the apron lanes, its boom reaching over the moored ship and its back part over the backreach behind the landside legs
- [ ] The boom's reach follows the ship's width, and the lifting height clears the ship's highest deck stack with a container hanging below
- [ ] The gantry (along the quay), trolley (along the boom) and hoist each move at believable quay-crane speeds and stop at their limits, never through the ship, a stack or the ground
- [ ] The boom can be raised upright and lowered; the trolley cannot run out over the water while it is up
- [ ] The spreader stretches between 20ft and 40ft and locks onto and releases a container under the same rules as the yard crane
- [ ] No moving part of the crane passes through any other part of it, at any position (checked automatically)
- [ ] A view shows the quay crane on its own and over the ship

## History
- 2026-10-16 17:09:50 backlog
- 2026-10-16 17:47:08 todo

## Notes
- Planner, 2026-10-16: added 261016170902 to blocked_by. The boom's reach follows the ship's width and the lifting height follows its deck tiers, and the view shows the crane over the ship, so the ship model has to exist first. This ticket does not wait for the deck stowage (261016170903): "never through the ship, a stack" is checked against the ship's hull and the tallest deck stack the ship allows (every deck tier full of High Cubes). Clearance against containers actually stowed on deck is checked in 261016170905 and 261016170906, which come after both.
- 2026-10-16 17:19:39: files estimated to change: `src/models/crane/controller.ts`, `src/models/quayCrane/`, `src/sim/world.ts`, `src/views/QuayCraneView.tsx`, `src/views/YardView.tsx`, `src/views/index.ts`
- 2026-10-16 17:20:09: files estimated to change: `src/models/crane/controller.ts`, `src/models/quayCrane/`, `src/sim/world.ts`, `src/styles.css`, `src/views/QuayCraneView.tsx`, `src/views/YardView.tsx`, `src/views/index.ts`
- Decision by mirza, 2026-10-16 (261016170901 question 4, for all nine tickets): the look-and-feel lines are checked by the reviewer in a browser with screenshots; no owner check, nothing deferred.
