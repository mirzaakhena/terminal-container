---
type: feature
priority: high
review:
labels: [model, yard]
reporter: mirza
assign_to: claude
created: 2026-10-08 10:46:26
updated: 2026-10-08 11:33:03
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
- [x] Changing the number of bays, rows and tiers in one setting changes the drawn block accordingly
- [x] Ground markings show bay and row slots, and bay and row numbers are readable from the default view
- [x] A container can be placed at an address (bay, row, tier) and appears exactly in that slot
- [x] A 40ft container occupies two neighbouring bays, and the view shows it over both
- [x] Placing a container in mid-air (nothing under it), in an occupied slot, or above the tier limit is refused with a clear message
- [x] A 20ft container cannot be stacked on top of a 40ft one and the other way round, and the attempt is refused with a clear message
- [x] A demo fill shows a believable, partly-filled block with mixed container sizes

## History
- 2026-10-08 10:46:26 backlog
- 2026-10-08 11:26:26 todo
- 2026-10-08 11:26:26 in_progress
- 2026-10-08 11:33:03 review

## Notes
- 2026-10-08 11:33:03: test run — `npm run build && npm test` exited 0 after 0m11s, on content fingerprint af8e8561872c82468af88beaa2a76ff71dc2d196 (the same before and after the run; .kerjaan/ left out).
- Open with the "Block" tab (or `?view=block`). The panel's Bays / Rows / Tiers steppers resize the block and refill it; the starting size is one setting, `DEFAULT_BLOCK` (10 bays × 6 rows × 5 high). "Demo fill" makes a new random fill, "Empty block" clears it, and the form places one container at a bay-row-tier address and shows why when it is refused.
- Address convention (standard terminal practice): 20ft bays are odd (01, 03 …); a 40ft covers two of them and takes the even number between (01 + 03 → 02, 05 + 07 → 06, …), so 40ft bay numbers are 02, 06, 10 …. Rows R01… count across the block, tiers from 1 at the ground. Which side of the block the truck lane is on is decided with the crane (261008104606).
- Slot spacing: 6.5 m per 20ft bay and 2.84 m per row (container width + 0.4 m gap).
- Refusals, all covered by automated tests: mid-air (including a 40ft half over an empty bay), occupied slot, above the tier limit, outside the block, wrong bay number for the size, 20ft on 40ft, 40ft on 20ft. Taking a container out while something stands on it is refused too, ready for the crane jobs (261008104608).
- Also added: each view can set its own home-view distance (the block view stands further back), and the camera moves to it when the view changes.
