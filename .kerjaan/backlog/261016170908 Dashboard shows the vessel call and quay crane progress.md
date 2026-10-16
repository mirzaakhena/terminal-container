---
type: feature
priority: low
review:
labels: [ui, dashboard, quay]
reporter: mirza
assign_to: claude
created: 2026-10-16 17:09:54
updated: 2026-10-16 17:11:13
related: [261016170906, 261008104609]
blocked_by: [261016170906]
---

## Background
The dashboard shows the yard: containers in the block, trucks, yard crane
moves per hour, a job timeline and an equipment table. With a ship at the
berth, the operator also wants to follow the ship's call: how many moves are
planned and done, how fast the quay crane is working, and when it will finish.

## Request
The dashboard covers the ship's call as well as the yard: headline figures
for the ship, a detail panel for the ship and the quay crane, and the quay
crane in the equipment table.

## Done when
- [ ] A headline card shows the ship's moves done out of planned, and the quay crane's moves per hour
- [ ] Clicking the ship or the quay crane in the scene shows its details in the right-hand panel (ship: name, size, fill, moves left; quay crane: status, current step, boom up/down, what it holds)
- [ ] The equipment table's Cranes tab lists the quay crane beside the yard crane, each with its status
- [ ] An estimated finish time for the ship's remaining moves is shown, worked out from the current rate
- [ ] The site picker lists the berth alongside the block, and choosing it frames the ship
- [ ] Finished, stopped and refused quay crane jobs appear in the notifications like yard jobs

## History
- 2026-10-16 17:09:54 backlog

## Notes
(none yet)
