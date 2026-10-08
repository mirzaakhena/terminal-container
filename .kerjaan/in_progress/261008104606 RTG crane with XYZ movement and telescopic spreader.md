---
type: feature
priority: high
review:
labels: [model, crane]
reporter: mirza
assign_to: claude
created: 2026-10-08 10:46:26
updated: 2026-10-08 11:56:49
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
- 2026-10-08 11:49:03 review
- 2026-10-08 11:53:48 in_progress

## Notes
- 2026-10-08 11:49:03: test run — `npm run build && npm test` exited 0 after 0m12s, on content fingerprint e9d53516fc96f7f57ae4111c43ab64e3844c3c73 (the same before and after the run; .kerjaan/ left out).
- Open with the "Crane" tab (or `?view=crane`); the view looks from the truck-lane side. Block A (10 bays × 6 rows × 5 high, demo-filled) with the truck lane beside row 1 and an empty truck parked in it. The panel has a slider per movement (gantry, trolley, hoist — the crane drives to the chosen position), 20ft/40ft spreader buttons, Lock, Release and Reset. Hold-to-move buttons, keyboard keys and snapping to slots come with 261008104607.
- Truck lane side: the lane runs alongside row 1, so rows count from the lane, as on the block ticket.
- Size: legs stand outside the lane on one side and outside row 6 on the other; the spreader can rise high enough to carry a High Cube over a full stack of High Cubes; a wider or taller block gives a wider or taller crane (tested).
- Speeds (believable RTG figures, with smooth acceleration and braking): gantry 2.2 m/s (130 m/min), trolley 1.2 m/s (70 m/min), hoist 0.87 m/s empty and 0.47 m/s loaded (52 / 28 m/min), spreader telescoping 1.2 m/s (about 5 s from 20ft to 40ft).
- Safety the crane enforces on its own: lowering stops on whatever is below (ground, stack, trailer deck); gantry and trolley will not drag a low spreader or its load sideways into a stack ("Raise the spreader first"); the spreader cannot change length while holding a container or if it would hit one.
- Lock is refused unless the spreader sits squarely (within 12 cm) on top of a container of the same length; release is refused in mid-air or anywhere but a proper block slot or trailer position, and the container then stays held. Released containers become part of the block (or truck load) at the right address and stay there. All covered by automated tests; also checked in the browser: picked a 20ft from bay 17 tier 3, carried it to the parked truck, set it down in the trailer's centre position.
- For testing in the browser during development only: `window.__porttrack.crane` gives the crane controller, and `window.__porttrack.bump()` redraws after a lock or release.

### Review 2026-10-08
Reviewed at level quick, round 1, at commit c9dd950: the project's checks were carried from the worker's run, the change was read against the criteria, and I went past quick on criterion 3 (opened the running app in a browser) because reading the code showed a clash that needed confirming.

Decision: **sent back to in_progress**. One criterion is not met.

Checks:
- `test-run.sh --check 261008104606` answered SAME: `npm run build && npm test` exited 0 at 2026-10-08 11:49:03 on fingerprint e9d53516fc96f7f57ae4111c43ab64e3844c3c73. Not run again.
- `explain.sh check`: no explanation written (setting is `off`), nothing to check.
- The work is in the main tree; there is no separate branch for this ticket.
- The project has no CLAUDE.md or AGENTS.md, so no written project rules apply.

Criteria:
1. Crane over the block with the truck lane under one leg span: met. Seen in the browser (`?view=crane`): the crane straddles Block A and the lane, with the truck parked in the lane.
2. Width and height follow rows and tiers, with room for a High Cube over the top tier: met. In `craneSpec` the top hoist position is the stack of High Cubes plus one more High Cube plus 0.8 m, and the legs are placed from the block width. The test "spans the block plus the truck lane..." checks this, and also checks that a bigger block gives a wider, taller crane.
3. Gantry, trolley and hoist stop at their limits and do not pass through the ground or the frame: **not met**. See the blocking finding below.
4. Spreader stretches between 20ft and 40ft: met by reading. The arms scale and the end beams move with `spreaderLength` every frame (`RtgCrane.tsx`), and the telescoping test covers it. I saw the 20ft spreader in the browser but did not take a picture of it at 40ft.
5. A locked container rises with the spreader and stays where it is released: met. The tests "locks onto a matching container... sets it down on a truck" and "a released container stays where it was put in the block" cover this, and the code removes the container from the block/truck on lock and puts it back at a real address on release.
6. Locking is refused for the wrong length or when not on a container: met. `pickUp` checks the nominal length and checks that the spreader is squarely on top (within 12 cm, touching within 3 cm). The test "refuses to lock..." covers both.
7. Believable speeds, written in the Notes: met. `SPEEDS` in `spec.ts` match the figures in Notes. The movement uses acceleration and braking, and a test checks that a 22 m gantry move takes longer than it would at full speed with no ramp-up.

Blocking finding: the moving parts pass into the crane's own structure.
- **At the top of its travel, the spreader pushes into the operator cab.** The cab hangs from the trolley at x 2.3 to 4.2 m, y from girder−2.2 m up to the girder, z −2.0 to −0.2 m (trolley frame, `RtgCrane.tsx`, the `<group position={[GIRDER_X + 0.4, top - 1.0, -1.1]}>` cab). The highest hoist position is girder − 2.35 m (`girderY = hoistMax + 0.45 + 0.7 + 1.2` in `spec.ts`), so the spreader frame (hoist +0.02 to +0.45 m) overlaps the cab's height by 0.3 m. In plan view they overlap too: with 20ft, the end beam at x = ±3.03 m (width ±1.22 m) sits inside the cab; with 40ft, the telescopic arm and the centre section (z ±0.3 / ±0.45 m) pass through the cab's z range. The crane **starts** at this top position, so this is the first thing a user sees. Confirmed in the browser: with trolley 8 m and hoist 18.18 m (the top limit), the yellow spreader end goes into the white cab box. Lowering the hoist to 14.18 m separates them.
- I looked for other moving parts hitting the frame and found none. With the trolley at either end of its travel, the spreader (and a carried container) stays clear of the legs, the leg ties and the power house (at row 6 there is about 1.7 m to the power house). A carried container hangs below the cab with about 15 cm to spare.
- What remains to be done: the spreader's top limit must stay clear of everything that hangs from the trolley, for both 20ft and 40ft lengths. Either move or raise the cab, or make the girder taller; lowering the top limit would cost the High Cube clearance that criterion 2 needs. A test that checks this clearance against the cab's dimensions would stop it coming back.

Notes (not blocking):
- Nothing else was found in the diff.

Not verified by running anything (judged by reading and by the worker's carried test run): criteria 2, 4 (the 40ft look), 5, 6, 7.

- 2026-10-08 11:56:49: test run — `npm run build && npm test` exited 0 after 0m12s, on content fingerprint 7b30e4325fb5b6997e988f00b8cdcaa2feddf3bb (the same before and after the run; .kerjaan/ left out).
- Fix after review round 1 (spreader rose into the operator cab at the top limit): the cab now hangs between the two girders on the lane side of the trolley, beside the spreader's path instead of above it. The crane's rigid parts (legs, beams, girders, power house, trolley, cab) are now one shared list of boxes that both the drawing and a new clearance test use. The test moves the spreader, headblock and every container type through the trolley's whole travel, from the ground to the top limit, at both spreader lengths, for three block sizes, and checks that nothing hanging touches any part of the crane, and that the cab never touches the frame. With the old cab position put back temporarily, the test fails with "spreader hits cab"; with the fix it passes.
