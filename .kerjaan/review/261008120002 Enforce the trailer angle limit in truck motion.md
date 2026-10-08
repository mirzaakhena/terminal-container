---
type: bug
priority: low
review:
labels: [truck, motion]
reporter: mirza
assign_to: claude
created: 2026-10-08 12:00:21
updated: 2026-10-08 13:36:19
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

## Notes
- 2026-10-08 13:36:06: test run — `npm run build && npm test && npm run test:e2e` exited 0 after 1m51s, on content fingerprint af6b3c8aa65dd92c2e584580fe49dab9210c2141 (the same before and after the run; .kerjaan/ left out).
- Both ways asked for in the Request are in place: before a truck sets off, its route is tried out in small steps and refused when the trailer would have to swing past 75°, with the angle it would need; and inside the motion itself the trailer's wheels can never be pulled past the limit, so the drawn trailer and the blue wheel track always agree, even on a route that skips the check.
- The Drive view has a route choice: "Demo route" (unchanged) and "Tight U-turn (5 m)". Choosing the U-turn shows "Route refused. … the trailer would have to swing 105° against the tractor, and 75° is the limit. Use wider corners." and the drive buttons are unavailable. Checked in the browser; switching back, the demo route drives as before.
- The yard's job route (11 m corners) stays inside the limit, so crane jobs are unaffected.
- Tests (`src/motion/motion.test.ts`): demo routes inside the limit and not refused; the U-turn refused before setting off with the reason; driven anyway, the angle never passes 75° and the wheel track matches the drawn trailer within 1 cm at every step.
