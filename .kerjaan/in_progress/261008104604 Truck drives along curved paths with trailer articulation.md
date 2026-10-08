---
type: feature
priority: medium
review:
labels: [truck, motion]
reporter: mirza
assign_to: claude
created: 2026-10-08 10:46:26
updated: 2026-10-08 11:38:10
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

## Notes
- 2026-10-08 11:38:10: test run — `npm run build && npm test` exited 0 after 0m12s, on content fingerprint 96ab7ac1b332c4065fced94f8d80d34b9e796e01 (the same before and after the run; .kerjaan/ left out).
- Open with the "Drive" tab (or `?view=drive`). The route goes from the Gate round two right-angle corners (14 m radius), along the crane lane, to the Exit. Panel buttons drive to the next named stop or send the truck back to the gate; readouts show speed, trailer angle and distance. With the checkbox on, the blue line traces the trailer's wheels against the white lane centre that the tractor follows — in each corner the blue line runs on the inside.
- How it moves: the tractor's drive axles follow the lane centre, and the trailer is towed by the kingpin (each step its wheels move straight toward the kingpin, keeping their distance) — the same reason real trailers cut corners. The trailer angle is limited to 75°. Yard speed is up to about 15 km/h, accelerating and braking smoothly.
- Automated tests: the trailer angles more than 15° in the corner and is back under 2° after it; trailer wheels pass more than 1 m inside the tractor's path; stops are reached within 10 cm; the trailer stays exactly one trailer-length behind the kingpin; trucks only drive forward.
- Wheels do not spin yet; that is cosmetic and was left out.
- The route and motion live in their own module (`src/motion/`), ready for the crane jobs to bring trucks to the crane lane (261008104608).
