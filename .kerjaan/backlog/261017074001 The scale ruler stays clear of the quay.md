---
type: bug
priority: low
review:
labels: [scene, quay]
reporter: mirza
assign_to: claude
created: 2026-10-17 07:40:00
updated: 2026-10-17 07:40:16
related: [261016170901]
blocked_by: []
---

## Background
When the grid is switched on, every view shows a small "10 m" ruler on the
ground so the viewer can judge sizes. The ruler is always drawn at the same
spot. Since the quayside was added beside the yard block, that spot falls on
the quay itself, between the quay crane's land-side rail and the first truck
lane on the apron. In the Yard home view it now covers part of the apron.

## How to reproduce
1. Open the app on the Yard view
2. Switch the grid on
3. Look at the area between the yard block and the water

The "10 m" ruler lies across the quay, on top of the apron lanes.

## Request
The ruler sits where it covers nothing of interest in each view, while still
being easy to find and read.

## Done when
- [ ] The steps above show the ruler on open ground, not on the quay or apron
- [ ] In every other view, with the grid on, the ruler still shows and covers no crane, truck, block or road
- [ ] The ruler still reads "10 m" and is as long as ten metres of the grid

## History
- 2026-10-17 07:40:00 backlog

## Notes
- 2026-10-17: raised by the reviewer of 261016170901 as a suggested follow-up; the owner asked for it as a ticket.
