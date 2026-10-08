---
type: feature
priority: high
review:
labels: [model, yard]
reporter: mirza
assign_to: claude
created: 2026-10-08 10:46:26
updated: 2026-10-08 10:47:39
related: [261008104602]
blocked_by: [261008104602]
---

## Background
Containers waiting in the yard are stacked in "blocks": rectangular areas
marked on the ground. A block is described by bays (slots along its length,
each the length of a 20ft container), rows (side by side across its width)
and tiers (how high the stack goes). A 40ft container takes two neighbouring
bays. Every container in the yard has an address made of block, bay, row and
tier, which is how operators say where a box is.

Different terminals use differently sized blocks, so the size must be
adjustable rather than fixed.

## Request
A storage block whose number of bays, rows and tiers can be set, drawn with
its ground markings, which can be filled with 20ft, 40ft and High Cube
containers at given addresses and which refuses placements that are physically
impossible.

## Done when
- [ ] Changing the number of bays, rows and tiers in one setting changes the drawn block accordingly
- [ ] Ground markings show bay and row slots, and bay and row numbers are readable from the default view
- [ ] A container can be placed at an address (bay, row, tier) and appears exactly in that slot
- [ ] A 40ft container occupies two neighbouring bays, and the view shows it over both
- [ ] Placing a container in mid-air (nothing under it), in an occupied slot, or above the tier limit is refused with a clear message
- [ ] A 20ft container cannot be stacked on top of a 40ft one and the other way round, and the attempt is refused with a clear message
- [ ] A demo fill shows a believable, partly-filled block with mixed container sizes

## History
- 2026-10-08 10:46:26 backlog

## Notes
(none yet)
