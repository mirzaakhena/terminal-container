---
type: bug
priority: low
review:
labels: [truck, motion]
reporter: mirza
assign_to: claude
created: 2026-10-08 12:00:21
updated: 2026-10-08 12:00:41
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
- [ ] The steps above no longer show the trailer and the blue wheel track drifting apart
- [ ] A route too tight for the truck is either refused with a message saying so, or driven with the trailer staying within 75° the whole way
- [ ] The demo route still drives exactly as before
- [ ] An automated test covers a route tight enough to reach the limit

## History
- 2026-10-08 12:00:21 backlog

## Notes
(none yet)
