---
type: feature
priority: medium
review:
labels: [jobs, truck, simulation]
reporter: mirza
assign_to: claude
created: 2026-10-10 01:02:38
updated: 2026-10-10 01:03:08
related: [261008104608]
blocked_by: []
---

## Background
In the Yard view, crane jobs run one after another, and only one truck is on
site at a time: the next truck only leaves the gate once the previous one has
driven out. In a real terminal several trucks are on site together — some
waiting at the gate, one or two waiting in the lane behind the truck being
served — and the crane moves on to the next truck as soon as it finishes with
one. The yard currently looks emptier and slower than a real one.

## Request
Trucks for queued jobs enter on their own, wait at the gate or in the lane
behind the truck being served without ever overlapping, and the crane goes
straight on to the next waiting truck when it finishes one.

## Done when
- [ ] With several jobs queued, more than one truck can be seen on site at once: one under the crane, others waiting in the lane or at the gate
- [ ] Trucks never overlap or drive through each other, in the lane or at the gate
- [ ] When the crane finishes a truck, it starts on the next waiting truck without waiting for the first to reach the exit
- [ ] A truck waiting in the lane never sits under a moving spreader or load
- [ ] The dashboard's "Trucks on site" and trucks table show every truck on site and where each one is (at gate, waiting, under the crane, leaving)
- [ ] The crane moves per hour figure goes up compared with one truck at a time, for the same demo jobs

## History
- 2026-10-10 01:02:38 backlog

## Notes
(none yet)
