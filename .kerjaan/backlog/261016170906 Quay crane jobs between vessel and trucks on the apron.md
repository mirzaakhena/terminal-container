---
type: feature
priority: medium
review:
labels: [quay-crane, jobs, simulation]
reporter: mirza
assign_to: claude
created: 2026-10-16 17:09:52
updated: 2026-10-16 17:11:11
related: [261016170905, 261008104608]
blocked_by: [261016170903, 261016170904]
---

## Background
When a ship calls, the quay crane works through a list of moves:
"discharge" moves take containers off the ship onto trucks waiting on the
apron, and "load" moves take containers from trucks onto the ship. The yard
crane already works this way for the block, with a checked queue, automatic
moves, trucks driving in and out, and recovery when a job cannot finish.

## Request
Quay crane jobs can be queued that make a truck drive onto the apron, the
quay crane move a container between that truck and a chosen ship address, and
the truck drive off — for discharge and load, 1 × 20ft, 2 × 20ft and 1 × 40ft —
checked before they start and recovered like yard jobs when they cannot finish.

## Done when
- [ ] A discharge job takes a container from a chosen ship address and puts it on a truck that drove onto the apron, and the truck drives off with it
- [ ] A load job takes a container off an arriving truck and stows it at a chosen free ship address
- [ ] A 2 × 20ft job fills or empties both trailer positions, one after the other
- [ ] Jobs that cannot be done (container buried, slot taken or in mid-air, wrong load) are refused before they start, with the reason
- [ ] Several jobs run one after another on their own; a job that stops partway pauses the queue and is recovered as in the yard
- [ ] Nothing ever passes through anything (checked automatically at every step), and the boom is down whenever the crane works
- [ ] A panel queues jobs with "Pick for me", demo jobs and the 1× / 4× / 10× speeds, like the yard's

## History
- 2026-10-16 17:09:52 backlog

## Notes
(none yet)
