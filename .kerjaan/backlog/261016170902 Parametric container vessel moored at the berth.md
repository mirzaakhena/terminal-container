---
type: feature
priority: high
review:
labels: [vessel, model]
reporter: mirza
assign_to: claude
created: 2026-10-16 17:09:48
updated: 2026-10-16 17:11:07
related: [261016170901]
blocked_by: [261016170901]
---

## Background
A container ship carries containers stacked in "bays" (slices across the
ship, each one 20ft container long), "rows" (side by side across the ship's
width) and "tiers" (layers upward). Ships come in very different sizes, from
small feeders of about 1,000 TEU (twenty-foot equivalent units, a measure of
capacity) to giants of over 20,000 TEU. The owner wants the ship's size to be
adjustable, with a small feeder as the default. Only the deck is modelled for
now; holds below deck come later (ticket 261016170909).

## Request
A container ship model, in the same soft low-poly style, whose length,
width and stacking height follow its number of bays, rows and tiers, lying
moored at the berth with its deck area ready to carry containers.

## Done when
- [ ] A ship lies at the berth in the Yard view, alongside the quay edge, in the scene's style (hull, accommodation block with bridge, funnel, deck)
- [ ] The default ship is a feeder of about 150 m long carrying 8 rows across, about 1,000 TEU, with its size shown in a label
- [ ] Changing the number of bays, rows and deck tiers in one setting changes the ship's length, width and the space on deck accordingly
- [ ] The ship's deck has visible container positions (lashing bridges or deck markings between bays) for every bay and row
- [ ] The ship never overlaps the quay, and its side stays a realistic small gap from the quay edge
- [ ] A separate view or tab shows the ship on its own, with sizes labelled, like the container and truck showrooms

## History
- 2026-10-16 17:09:48 backlog

## Notes
(none yet)
