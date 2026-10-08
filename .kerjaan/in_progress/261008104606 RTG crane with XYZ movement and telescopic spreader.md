---
type: feature
priority: high
review:
labels: [model, crane]
reporter: mirza
assign_to: claude
created: 2026-10-08 10:46:26
updated: 2026-10-08 11:49:03
related: [261008104605, 261008104603]
blocked_by: [261008104601, 261008104602]
---

## Background
Containers are moved between the block and the trucks by a rubber-tyred
gantry crane (RTG): a tall steel frame on rubber wheels that straddles the
whole width of a block plus one truck lane beside it. It moves in three
directions: the whole crane drives along the block (X), a trolley runs across
the top beam from one side to the other (Z), and the hoist lowers and raises
the lifting frame (Y).

The lifting frame is called the spreader. It locks onto the four top corners
of a container. Ours is telescopic: it can stretch to fit either a 20ft or a
40ft container. It lifts one container at a time.

## Request
An RTG crane model in the reference style, sized to straddle a block of a
chosen width plus one truck lane, whose gantry, trolley and spreader can each
be moved within realistic limits, with a spreader that extends between 20ft
and 40ft and can lock onto and release a container.

## Done when
- [x] A view shows the RTG standing over a block with a truck lane under one leg span
- [x] The crane's width and height adjust to the block's number of rows and tiers, with room for a High Cube to pass over the top tier
- [x] The gantry, trolley and hoist can each be moved, and stop at their limits instead of passing through the ground or out of the frame
- [x] The spreader visibly stretches between 20ft and 40ft length
- [x] When the spreader is lowered onto a container of matching length and locked, the container rises with it; when released, it stays where it was put
- [x] Locking is refused when the spreader length does not match the container, or the spreader is not sitting on the container
- [x] Speeds of each movement are believable (written in the Notes) rather than instant

## History
- 2026-10-08 10:46:26 backlog
- 2026-10-08 11:26:26 todo
- 2026-10-08 11:39:14 in_progress

## Notes
- 2026-10-08 11:49:03: test run — `npm run build && npm test` exited 0 after 0m12s, on content fingerprint e9d53516fc96f7f57ae4111c43ab64e3844c3c73 (the same before and after the run; .kerjaan/ left out).
- Open with the "Crane" tab (or `?view=crane`); the view looks from the truck-lane side. Block A (10 bays × 6 rows × 5 high, demo-filled) with the truck lane beside row 1 and an empty truck parked in it. The panel has a slider per movement (gantry, trolley, hoist — the crane drives to the chosen position), 20ft/40ft spreader buttons, Lock, Release and Reset. Hold-to-move buttons, keyboard keys and snapping to slots come with 261008104607.
- Truck lane side: the lane runs alongside row 1, so rows count from the lane, as on the block ticket.
- Size: legs stand outside the lane on one side and outside row 6 on the other; the spreader can rise high enough to carry a High Cube over a full stack of High Cubes; a wider or taller block gives a wider or taller crane (tested).
- Speeds (believable RTG figures, with smooth acceleration and braking): gantry 2.2 m/s (130 m/min), trolley 1.2 m/s (70 m/min), hoist 0.87 m/s empty and 0.47 m/s loaded (52 / 28 m/min), spreader telescoping 1.2 m/s (about 5 s from 20ft to 40ft).
- Safety the crane enforces on its own: lowering stops on whatever is below (ground, stack, trailer deck); gantry and trolley will not drag a low spreader or its load sideways into a stack ("Raise the spreader first"); the spreader cannot change length while holding a container or if it would hit one.
- Lock is refused unless the spreader sits squarely (within 12 cm) on top of a container of the same length; release is refused in mid-air or anywhere but a proper block slot or trailer position, and the container then stays held. Released containers become part of the block (or truck load) at the right address and stay there. All covered by automated tests; also checked in the browser: picked a 20ft from bay 17 tier 3, carried it to the parked truck, set it down in the trailer's centre position.
- For testing in the browser during development only: `window.__porttrack.crane` gives the crane controller, and `window.__porttrack.bump()` redraws after a lock or release.
