---
type: feature
priority: high
review:
labels: [model, crane]
reporter: mirza
assign_to: claude
created: 2026-10-08 10:46:26
updated: 2026-10-08 10:47:39
related: [261008104605, 261008104603]
blocked_by: [261008104601, 261008104602]
---

## Background
Containers are moved between the block and the trucks by a rubber-tyred
gantry crane (RTG): a tall steel frame on rubber wheels that straddles the
whole width of a block plus one truck lane beside it. It moves in three
directions: the whole crane drives along the block (X), a trolley runs across
the top beam from one side to the other (Z), and the hoist lowers and raises
the lifting frame (Y).

The lifting frame is called the spreader. It locks onto the four top corners
of a container. Ours is telescopic: it can stretch to fit either a 20ft or a
40ft container. It lifts one container at a time.

## Request
An RTG crane model in the reference style, sized to straddle a block of a
chosen width plus one truck lane, whose gantry, trolley and spreader can each
be moved within realistic limits, with a spreader that extends between 20ft
and 40ft and can lock onto and release a container.

## Done when
- [ ] A view shows the RTG standing over a block with a truck lane under one leg span
- [ ] The crane's width and height adjust to the block's number of rows and tiers, with room for a High Cube to pass over the top tier
- [ ] The gantry, trolley and hoist can each be moved, and stop at their limits instead of passing through the ground or out of the frame
- [ ] The spreader visibly stretches between 20ft and 40ft length
- [ ] When the spreader is lowered onto a container of matching length and locked, the container rises with it; when released, it stays where it was put
- [ ] Locking is refused when the spreader length does not match the container, or the spreader is not sitting on the container
- [ ] Speeds of each movement are believable (written in the Notes) rather than instant

## History
- 2026-10-08 10:46:26 backlog

## Notes
(none yet)
