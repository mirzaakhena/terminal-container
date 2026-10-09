---
type: feature
priority: low
review:
labels: [crane, spreader]
reporter: mirza
assign_to: claude
created: 2026-10-10 01:02:39
updated: 2026-10-10 01:03:08
related: [261008104606, 261008104608]
blocked_by: []
---

## Background
The RTG's spreader lifts one container at a time. For a truck carrying two
20ft containers, the crane makes two full trips. Many real spreaders can
"twin-lift": with the spreader at 40ft length, they lock onto two 20ft
containers standing end to end and move both together, which nearly halves the
time for such trucks.

At the start of the project the owner chose single-lift only; this ticket
would reverse that decision, so it needs the owner's go-ahead before it is
started.

## Request
The spreader can lift two 20ft containers standing end to end in one move —
from a pair of neighbouring bays in the block or from a trailer's front and
rear positions — and set them down together, and crane jobs use it whenever
both ends allow it.

## Done when
- [ ] The owner has confirmed twin-lift is wanted (it reverses the earlier single-lift choice); the decision is written in this ticket
- [ ] With the spreader at 40ft, it can lock onto two 20ft containers that stand end to end at the same height, and they rise together
- [ ] Twin-lift is refused, with a reason, when the two are not level, not both 20ft, or one has something on top
- [ ] A 2 × 20ft delivery or receiving job uses one twin-lift move when both containers are side by side in the block, and two single moves otherwise
- [ ] Manual controls in the Crane view offer twin-lift when it is possible
- [ ] Containers lifted together never pass through anything, as with single lifts

## History
- 2026-10-10 01:02:39 backlog

## Notes
(none yet)
