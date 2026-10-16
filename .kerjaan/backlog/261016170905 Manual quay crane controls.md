---
type: feature
priority: medium
review:
labels: [quay-crane, controls]
reporter: mirza
assign_to: claude
created: 2026-10-16 17:09:51
updated: 2026-10-16 17:11:10
related: [261016170904, 261008104607]
blocked_by: [261016170903, 261016170904]
---

## Background
The yard crane can be driven by hand with hold-to-move buttons and keys, and
lines itself up on the nearest slot when let go. The quay crane needs the same,
so a person can try moves and check it behaves correctly before jobs run it
automatically.

## Request
On-screen controls and keys that move the quay crane's gantry, trolley and
hoist, raise and lower the boom, change spreader length, and lock or release,
with a readout of where it is and auto lining-up on ship positions and apron
lanes.

## Done when
- [ ] Hold-to-move buttons and keys move the gantry, trolley and hoist both ways, and the keys are listed on screen
- [ ] Buttons raise and lower the boom, switch the spreader between 20ft and 40ft, and lock or release
- [ ] Letting go near a ship bay and row, or near an apron lane position, lines the crane up on it, as the yard crane does
- [ ] A readout shows each movement in metres, the boom position, whether something is locked, and where the spreader is in ship terms ("Over bay 06 · row 02") or "apron lane 1"
- [ ] Controls that cannot be used at the moment are shown as unavailable, with the reason
- [ ] Using only the controls, a person can take a container off the ship and set it on a truck parked on the apron
- [ ] Losing window focus while holding a control stops and lines up, as on the yard crane

## History
- 2026-10-16 17:09:51 backlog

## Notes
(none yet)
