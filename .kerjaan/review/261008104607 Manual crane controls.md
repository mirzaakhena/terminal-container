---
type: feature
priority: medium
review:
labels: [crane, controls]
reporter: mirza
assign_to: claude
created: 2026-10-08 10:46:26
updated: 2026-10-08 12:06:06
related: [261008104606]
blocked_by: [261008104606]
---

## Background
Once the crane exists, a person needs a way to drive it by hand, to try
moves and to check the crane behaves correctly. Real crane operators work
each movement separately with joysticks.

## Request
On-screen controls and keyboard keys that move the crane's gantry, trolley
and hoist, change spreader length, and lock or release a container, with a
small readout showing where the crane is.

## Done when
- [x] On-screen buttons move the gantry, trolley and hoist, each in both directions, while held down
- [x] The same movements work from the keyboard, and the keys are listed on screen
- [x] Buttons switch the spreader between 20ft and 40ft and lock or release a container
- [x] A readout shows the crane's position on each axis in metres and whether a container is locked
- [x] Using the controls, a person can pick a container from the block and place it on a parked truck without any code changes
- [x] Controls that cannot be used at the moment (for example, release while carrying nothing) are shown as unavailable

## History
- 2026-10-08 10:46:26 backlog
- 2026-10-08 12:00:41 todo
- 2026-10-08 12:00:41 in_progress
- 2026-10-08 12:06:06 review

## Notes
- 2026-10-08 12:06:05: test run — `npm run build && npm test` exited 0 after 0m13s, on content fingerprint 0182c3313e20ca630dfc0d35474229442735b276 (the same before and after the run; .kerjaan/ left out).
- In the "Crane" view the panel now has, per movement, two hold-to-move buttons (gantry back/forward, trolley to lane/to block, hoist lower/raise) with the position in metres and the keys beside them: A/D or ←/→ gantry, W/S or ↑/↓ trolley, F/R hoist, 2 and 4 for 20ft/40ft, L lock, U release. The sliders from the crane ticket are gone.
- Readout: position on each axis, a Locked/Unlocked badge with the container number, and "Over bay 17 · row 01" or "Over TRK-01 centre 20ft position · truck lane".
- Lining up: positioning a spreader to within 12 cm by eye is not practical, so — as on real RTGs with auto-positioning — when a movement button is let go, the crane coasts to a stop and then finishes on the nearest bay (or trailer position, when over the lane) and the nearest row. Inside the block every stop lands on a slot; beyond the block it stops where it is.
- Unavailable controls are greyed out with the reason on hover and in the hint line: Lock until the spreader rests squarely on a container of matching length, Release until the load rests in a slot or on a trailer position, spreader length while holding a container, and each direction at its limit (lower stops at whatever is underneath).
- Checked in the browser: with keys only, picked a 20ft from bay 17 row 01 and set it on the parked truck's centre position; with the mouse, holding "Forward" moved the gantry and letting go lined it up on the truck's front position. Automated tests repeat the pick-and-place using hold-and-let-go only.
