---
type: feature
priority: high
review:
labels: [vessel, stowage]
reporter: mirza
assign_to: claude
created: 2026-10-16 17:09:49
updated: 2026-10-16 17:47:08
related: [261016170902, 261008104605]
blocked_by: [261016170902]
---

## Background
Every container on a ship has an address made of bay, row and tier, written
the way ships do it everywhere:
- bays are numbered from the front of the ship: odd numbers (01, 03, 05 …) for
  20ft positions, and the even number between two of them (02, 06 …) for a
  40ft container covering both;
- rows count outwards from the ship's centre line: odd numbers to the right
  (starboard), even numbers to the left (port);
- tiers on deck start at 82 and go up in steps of two (82, 84, 86 …).
The same physical rules as in the yard block apply: nothing in mid-air, no
20ft on top of a 40ft, and a stacking height limit.

## Request
Containers can be placed on the ship's deck at ship addresses, are drawn in
those positions, are refused where physically impossible, and a believable
part-loaded demo ship can be generated.

## Done when
- [ ] A container placed at a ship address (for example 06-02-84) appears exactly in that position on the deck
- [ ] Bay, row and tier numbers follow the ship convention above, and the row numbers are shown across the ship and bay numbers along it
- [ ] A 40ft container covers two neighbouring 20ft bays, as in the yard block
- [ ] Placing in mid-air, in a taken slot, above the stack limit, or a 20ft on a 40ft (and the other way round) is refused with a clear message
- [ ] A demo stowage fills the ship partly with a believable mix of 20ft, 40ft and High Cube containers, the same every time for the same setting
- [ ] Taking a container off is refused while anything stands on it

## History
- 2026-10-16 17:09:49 backlog
- 2026-10-16 17:47:08 todo

## Notes
- 2026-10-16 17:19:37: files estimated to change: `src/models/vessel/`, `src/styles.css`, `src/views/VesselView.tsx`, `src/views/YardView.tsx`
- Decision by mirza, 2026-10-16 (261016170901 question 4, for all nine tickets): the look-and-feel lines are checked by the reviewer in a browser with screenshots; no owner check, nothing deferred.
