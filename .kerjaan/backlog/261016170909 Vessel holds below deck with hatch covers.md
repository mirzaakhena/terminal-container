---
type: feature
priority: low
review:
labels: [vessel, stowage]
reporter: mirza
assign_to: claude
created: 2026-10-16 17:09:55
updated: 2026-10-16 17:11:14
related: [261016170903]
blocked_by: [261016170903, 261016170904]
---

## Background
Container ships carry many containers below deck, in holds closed by large
steel lids called hatch covers. To reach a container in a hold, the quay crane
first lifts the hatch cover off and sets it down (on the quay or on another
hatch), and puts it back afterwards. Hold tiers are numbered from the bottom:
02, 04, 06 …. The owner chose to model the deck first and the holds later.

## Request
The ship has holds below deck under hatch covers; containers can be stowed in
the holds at hold addresses, and the quay crane lifts a hatch cover off and
back on when a move needs the hold beneath it.

## Done when
- [ ] Each bay has a hold below deck under hatch covers, shown in the ship model and in its showroom view
- [ ] Containers can be stowed in the holds at addresses with hold tiers (02, 04 …), under the same stacking rules as on deck
- [ ] A hatch cover cannot be lifted while containers stand on it on deck; trying says which containers are in the way
- [ ] The quay crane can lift a hatch cover off, set it down on the quay, and put it back
- [ ] A quay crane job for a hold container lifts the hatch cover first and puts it back after, on its own
- [ ] The demo stowage fills holds as well as the deck

## History
- 2026-10-16 17:09:55 backlog

## Notes
(none yet)
