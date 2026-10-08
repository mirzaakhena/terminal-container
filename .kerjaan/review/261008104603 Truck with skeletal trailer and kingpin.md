---
type: feature
priority: high
review:
labels: [model, truck]
reporter: mirza
assign_to: claude
created: 2026-10-08 10:46:26
updated: 2026-10-08 11:18:11
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
- [x] A view shows the truck in the reference's style, similar in feel to the trucks in the style reference
- [x] The kingpin and fifth wheel are visible and the trailer front sits on the fifth wheel
- [x] The truck can be shown empty, with one 20ft, with two 20ft, and with one 40ft or 40ft High Cube container, and a switch in the view changes between them
- [x] In every load, each container's corners sit on twistlock positions with no visible floating or overlap
- [x] A single 20ft load sits in the position a real terminal would use (stated in the Notes), not at a random spot
- [x] Asking the trailer for a load it cannot carry (for example three 20ft containers) is refused with a clear message instead of drawing something wrong

## History
- 2026-10-08 10:46:26 backlog
- 2026-10-08 10:57:35 todo
- 2026-10-08 11:14:40 in_progress
- 2026-10-08 11:18:11 review

## Notes
- 2026-10-08 11:18:10: test run — `npm run build && npm test` exited 0 after 0m10s, on content fingerprint e90bcab0b8880ec3b90612e793473af011bc2a54 (the same before and after the run; .kerjaan/ left out).
- Open with the "Truck" tab (or `?view=truck`). Top: the coupled truck, its load switched from the panel at the bottom left. Front: the same trailer standing on its landing legs beside a tractor pulled forward, labelled kingpin, fifth wheel and landing legs. The kingpin hangs under the trailer's front plate, so orbit the camera low to see it.
- Single 20ft position: the centre of the trailer, on the middle twistlocks of a combination chassis. Centred, the weight is shared between the tractor's drive axles and the trailer's axles; a 20ft at either end would overload one of them. A pair of 20ft containers uses the front and rear positions, 76 mm apart.
- "Try an impossible load (3 × 20ft)" shows the refusal message; other refused combinations (40ft + 20ft, two 40ft, a 20ft in the 40ft position, overlapping positions) are covered by automated tests.
- One set of twistlocks serves every load; tests check that every corner casting of every legal load lands on a twistlock within 5 mm and that loads never overlap or overhang the deck.
- Built for the next tickets: tractor and trailer each have their own origin at the kingpin, and the truck takes an `articulation` angle (ticket 261008104604); single-slot checks (`canPlace`) let a crane put a 20ft pair down one at a time (ticket 261008104608).
