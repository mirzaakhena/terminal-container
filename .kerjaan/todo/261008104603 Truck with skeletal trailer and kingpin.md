---
type: feature
priority: high
review:
labels: [model, truck]
reporter: mirza
assign_to: claude
created: 2026-10-08 10:46:26
updated: 2026-10-08 10:57:35
related: [261008104602]
blocked_by: [261008104601, 261008104602]
---

## Background
Containers leave and arrive at the yard on trucks. A container truck has two
parts: the tractor (the cab with the engine) and the trailer, here a
"skeletal" trailer — a bare steel frame built only to carry containers. The
trailer hooks onto the tractor through a kingpin, a steel pin under the front
of the trailer that drops into a round coupling plate on the tractor (the
"fifth wheel"); the trailer pivots around this pin when the truck turns.

Containers are held on the trailer by twistlocks: small locks that fit into
the container's corner castings. A 40-foot skeletal trailer carries either one
20ft container, two 20ft containers, or one 40ft container (standard or High
Cube), so its twistlocks must sit in the right places for each case.

## Request
A tractor-and-trailer model in the reference style, with a visible kingpin and
fifth wheel, and a trailer that can carry each of the four loads: empty, one
20ft, two 20ft, or one 40ft (standard or High Cube), with each container
sitting exactly on its twistlocks.

## Done when
- [ ] A view shows the truck in the reference's style, similar in feel to the trucks in the style reference
- [ ] The kingpin and fifth wheel are visible and the trailer front sits on the fifth wheel
- [ ] The truck can be shown empty, with one 20ft, with two 20ft, and with one 40ft or 40ft High Cube container, and a switch in the view changes between them
- [ ] In every load, each container's corners sit on twistlock positions with no visible floating or overlap
- [ ] A single 20ft load sits in the position a real terminal would use (stated in the Notes), not at a random spot
- [ ] Asking the trailer for a load it cannot carry (for example three 20ft containers) is refused with a clear message instead of drawing something wrong

## History
- 2026-10-08 10:46:26 backlog
- 2026-10-08 10:57:35 todo

## Notes
(none yet)
