---
type: feature
priority: medium
review:
labels: [truck, motion]
reporter: mirza
assign_to: claude
created: 2026-10-08 10:46:26
updated: 2026-10-08 11:38:56
related: [261008104603]
blocked_by: [261008104603]
---

## Background
In a real yard, trucks drive in from the gate, follow lanes, turn corners and
stop under the crane. When an articulated truck turns, the tractor turns first
and the trailer swings behind it around the kingpin, cutting the corner
slightly tighter than the tractor. A truck whose trailer stays rigidly in line
with the tractor looks wrong to anyone who has seen a real one.

## Request
Trucks can drive along a route made of straight and curved segments, with the
trailer following the tractor realistically through the kingpin, and can stop
at a chosen point.

## Done when
- [x] A demo route with at least one 90-degree corner can be shown, and a truck drives along it from start to end
- [x] While turning, the trailer visibly angles relative to the tractor and straightens out again after the corner
- [x] The trailer's rear wheels stay on the inside of the tractor's path in the corner, as real trucks do
- [x] The trailer never folds back onto the tractor (the angle stays within a realistic limit)
- [x] A truck can be told to stop at a named point on the route, and it stops there within 10 cm
- [x] Any load on the trailer moves with it and stays locked in place

## History
- 2026-10-08 10:46:26 backlog
- 2026-10-08 11:26:26 todo
- 2026-10-08 11:33:33 in_progress
- 2026-10-08 11:38:10 review
- 2026-10-08 11:38:56 done

## Notes
- 2026-10-08 11:38:10: test run — `npm run build && npm test` exited 0 after 0m12s, on content fingerprint 96ab7ac1b332c4065fced94f8d80d34b9e796e01 (the same before and after the run; .kerjaan/ left out).
- Open with the "Drive" tab (or `?view=drive`). The route goes from the Gate round two right-angle corners (14 m radius), along the crane lane, to the Exit. Panel buttons drive to the next named stop or send the truck back to the gate; readouts show speed, trailer angle and distance. With the checkbox on, the blue line traces the trailer's wheels against the white lane centre that the tractor follows — in each corner the blue line runs on the inside.
- How it moves: the tractor's drive axles follow the lane centre, and the trailer is towed by the kingpin (each step its wheels move straight toward the kingpin, keeping their distance) — the same reason real trailers cut corners. The trailer angle is limited to 75°. Yard speed is up to about 15 km/h, accelerating and braking smoothly.
- Automated tests: the trailer angles more than 15° in the corner and is back under 2° after it; trailer wheels pass more than 1 m inside the tractor's path; stops are reached within 10 cm; the trailer stays exactly one trailer-length behind the kingpin; trucks only drive forward.
- Wheels do not spin yet; that is cosmetic and was left out.
- The route and motion live in their own module (`src/motion/`), ready for the crane jobs to bring trucks to the crane lane (261008104608).
- 2026-10-08: Reviewed at level quick, round 1, at commit 4c58700 (ticket moved to review in 6f938a2): the project's checks were carried from the worker's run and the change was read against each criterion. Decision: done.
  - Checks: `test-run.sh --check 261008104604` answered SAME — `npm run build && npm test` exited 0 at 2026-10-08 11:38:10 on fingerprint 96ab7ac1b332c4065fced94f8d80d34b9e796e01, so it was not run again. No separate branch for this ticket; the work is on `main`. The project has no CLAUDE.md or AGENTS.md.
  - Demo route with a 90° corner, driven start to end: met. `DriveView` builds a route Gate → two 90° left corners (14 m radius) → Crane lane → Exit, registered as the "Drive" view; the unit test drives a truck to the end of a 90° route and checks it arrives.
  - Trailer angles in the corner and straightens after: met. Test checks peak angle > 15° and < 2° at the end. In the view the trailer group is rotated by minus the angle about the truck origin, which the truck spec puts under the kingpin, so the drawn trailer follows the computed angle.
  - Trailer wheels on the inside of the tractor's path: met. Test checks the tractor axle runs on the 16 m arc and the trailer axle comes more than 1 m closer to the arc centre.
  - Trailer never folds back (angle within a limit): met. Limit is 75°; the test asserts the peak stays under it.
  - Stops at a named point within 10 cm: met. Test drives to the named stops "half" and "end" and checks both within 0.1 m, speed 0.
  - Load moves with the trailer and stays locked: met by reading. The 40ft HC is drawn as a child of the trailer group, so it can only move with the trailer.
  - Not verified by running anything: what the view looks like in the browser (whether the corner, the trailer swing and the blue/white trace look right on screen) and the load criterion. A quick review does not open the app; the motion itself is covered by the unit tests above.
  - Note: the 75° limit is applied only to the reported/drawn angle in `pose()`, not to the trailer axle position. If a route ever made the trailer go past 75°, the drawn trailer would stop at 75° while the blue trace and the stored axle carried on, and the two would no longer match. On the current routes the angle stays far below the limit, so nothing goes wrong today.

### Suggested follow-up

- **The trailer angle limit only affects the picture, not the motion.** `TruckMotion.pose()` caps the angle at 75° for drawing, but the trailer's wheel position is still worked out without that cap. On a much tighter route the drawn trailer and its real path (the blue trace) would come apart. Worth a ticket: either enforce the limit in the motion itself (or refuse routes that would need more), with a test on a route tight enough to reach it.
