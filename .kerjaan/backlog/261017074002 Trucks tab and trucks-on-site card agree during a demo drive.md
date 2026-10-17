---
type: bug
priority: low
review:
labels: [dashboard, truck]
reporter: mirza
assign_to: claude
created: 2026-10-17 07:40:00
updated: 2026-10-17 07:40:16
related: [261016170901]
blocked_by: []
---

## Background
The Yard view can send one truck on a demo drive that goes from the gate,
along the quay and back out through the block. Two places on screen tell how
many trucks are on site: a card at the top ("Trucks on site") and the Trucks
tab in the panel at the bottom right. During a demo drive they disagree: the
card counts the demo truck, the tab does not.

## How to reproduce
1. Open the app on the Yard view, with no jobs running
2. Press "Demo drive via quay"
3. While the truck is on the road, look at the top card and the Trucks tab

The card says 1 truck on site; the Trucks tab says "Trucks 0 · No trucks yet".

## Request
Both places tell the same story about the demo truck, so a viewer never sees
two different truck counts at once.

## Done when
- [ ] The steps above show the same number of trucks in the card and in the Trucks tab
- [ ] Once the demo truck has left, both show no trucks on site
- [ ] During ordinary crane jobs, both still count the job trucks as before

## History
- 2026-10-17 07:40:00 backlog

## Notes
- 2026-10-17: raised by the reviewer of 261016170901 as a suggested follow-up; the owner asked for it as a ticket. Whether the tab lists the demo truck or the card leaves it out is the worker's choice, as long as the two agree.
