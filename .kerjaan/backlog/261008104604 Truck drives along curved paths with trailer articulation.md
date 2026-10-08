---
type: feature
priority: medium
review:
labels: [truck, motion]
reporter: mirza
assign_to: claude
created: 2026-10-08 10:46:26
updated: 2026-10-08 10:47:39
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
- [ ] A demo route with at least one 90-degree corner can be shown, and a truck drives along it from start to end
- [ ] While turning, the trailer visibly angles relative to the tractor and straightens out again after the corner
- [ ] The trailer's rear wheels stay on the inside of the tractor's path in the corner, as real trucks do
- [ ] The trailer never folds back onto the tractor (the angle stays within a realistic limit)
- [ ] A truck can be told to stop at a named point on the route, and it stops there within 10 cm
- [ ] Any load on the trailer moves with it and stays locked in place

## History
- 2026-10-08 10:46:26 backlog

## Notes
(none yet)
