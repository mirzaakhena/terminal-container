---
type: bug
priority: low
review:
labels: [truck, motion]
reporter: mirza
assign_to: claude
created: 2026-10-08 12:00:21
updated: 2026-10-08 13:37:28
related: [261008104604]
blocked_by: []
---

## Background
When a truck turns, the trailer swings behind the tractor about the kingpin.
The program limits the angle between them to 75°, as a real trailer would
touch the tractor beyond that. But the limit is only applied to what is drawn:
the calculation of where the trailer's wheels are keeps going past it. On the
current demo route the angle never goes above about 30°, so nothing shows.
On a much tighter route the drawn trailer and its wheel track (the blue line)
would stop matching. The reviewer of the truck-motion ticket found this.

## How to reproduce
1. Make a route with a corner much tighter than the demo's (for example a 5 m radius U-turn)
2. Open the Drive view with that route and drive the truck through the corner
3. Watch the trailer and the blue wheel track

The trailer stops turning at 75° while the blue line keeps curving inward, so the two no longer line up.

## Request
A truck must never take a corner its trailer cannot follow: either the
trailer's movement itself stays within the limit, or a route that would need
more than the limit is refused before the truck sets off, with a clear reason.

## Done when
- [x] The steps above no longer show the trailer and the blue wheel track drifting apart
- [x] A route too tight for the truck is either refused with a message saying so, or driven with the trailer staying within 75° the whole way
- [x] The demo route still drives exactly as before
- [x] An automated test covers a route tight enough to reach the limit

## History
- 2026-10-08 12:00:21 backlog
- 2026-10-08 13:26:18 todo
- 2026-10-08 13:33:08 in_progress
- 2026-10-08 13:36:19 review
- 2026-10-08 13:37:28 done

## Notes
- 2026-10-08 13:36:06: test run — `npm run build && npm test && npm run test:e2e` exited 0 after 1m51s, on content fingerprint af6b3c8aa65dd92c2e584580fe49dab9210c2141 (the same before and after the run; .kerjaan/ left out).
- Both ways asked for in the Request are in place: before a truck sets off, its route is tried out in small steps and refused when the trailer would have to swing past 75°, with the angle it would need; and inside the motion itself the trailer's wheels can never be pulled past the limit, so the drawn trailer and the blue wheel track always agree, even on a route that skips the check.
- The Drive view has a route choice: "Demo route" (unchanged) and "Tight U-turn (5 m)". Choosing the U-turn shows "Route refused. … the trailer would have to swing 105° against the tractor, and 75° is the limit. Use wider corners." and the drive buttons are unavailable. Checked in the browser; switching back, the demo route drives as before.
- The yard's job route (11 m corners) stays inside the limit, so crane jobs are unaffected.
- Tests (`src/motion/motion.test.ts`): demo routes inside the limit and not refused; the U-turn refused before setting off with the reason; driven anyway, the angle never passes 75° and the wheel track matches the drawn trailer within 1 cm at every step.

### Review 2026-10-08
Reviewed at level quick, round 1, at commit 3d433d8: the project's checks were counted once (carried from the worker's run) and the change was read against the criteria. One extra check was run past quick (see criterion 3).

- Checks: `test-run.sh --check 261008120002` answered SAME: `npm run build && npm test && npm run test:e2e` exited 0 on exactly this content at 2026-10-08 13:36:06, fingerprint af6b3c8aa65dd92c2e584580fe49dab9210c2141. Not run again.
- Work is on the current branch; there is no separate ticket branch. The project has no CLAUDE.md or AGENTS.md. `owner_explanation` is off.
- Criterion 1 (trailer and blue track no longer drift apart): met. `towTrailer` now holds the trailer's wheels inside 75° itself, so the drawn angle (clamped in `pose()`) and the wheel track come from the same position. The test "even if driven anyway…" checks at every step that the drawn trailer and the wheel position agree within 1 cm on the 5 m U-turn. Without the new limit in `towTrailer`, the clamp in `pose()` would make them disagree, so this test is not empty. Judged by reading the code and the passing test; the browser was not opened.
- Criterion 2 (tight route refused with a message, or driven within 75°): met, both ways. `routeProblem` gives the reason, `driveTo` refuses, and the Drive view shows "Route refused." and switches off the drive buttons. Covered by the tests. The on-screen wording was judged by reading `DriveView.tsx` only.
- Criterion 3 (demo route drives exactly as before): met. The new limit only acts above 75°, and the test shows the demo route stays below 60°. Beyond quick: I also checked the yard's crane-job route (`laneRoute`), which now goes through the same refusal check. It peaks at about 42° for block lengths 20, 60 and 120, so crane jobs are not refused. This was a one-off vitest script in /tmp.
- Criterion 4 (automated test reaches the limit): met. `src/motion/motion.test.ts` has the "trailer angle limit" block on a 5 m U-turn that needs 105°.

Notes (not blocking):
- `DrivePanel` builds a whole `TruckMotion` just to read `routeProblem`. Calling `peakArticulation(route)` would be enough. This is cosmetic.
- No end-to-end (Playwright) test covers the new route choice or the refusal notice in the browser. The unit tests cover the logic.
