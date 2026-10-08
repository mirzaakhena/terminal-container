---
type: feature
priority: medium
review:
labels: [crane, controls]
reporter: mirza
assign_to: claude
created: 2026-10-08 10:46:26
updated: 2026-10-08 12:07:39
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
- 2026-10-08 12:07:39 done

## Notes
- 2026-10-08 12:06:05: test run — `npm run build && npm test` exited 0 after 0m13s, on content fingerprint 0182c3313e20ca630dfc0d35474229442735b276 (the same before and after the run; .kerjaan/ left out).
- In the "Crane" view the panel now has, per movement, two hold-to-move buttons (gantry back/forward, trolley to lane/to block, hoist lower/raise) with the position in metres and the keys beside them: A/D or ←/→ gantry, W/S or ↑/↓ trolley, F/R hoist, 2 and 4 for 20ft/40ft, L lock, U release. The sliders from the crane ticket are gone.
- Readout: position on each axis, a Locked/Unlocked badge with the container number, and "Over bay 17 · row 01" or "Over TRK-01 centre 20ft position · truck lane".
- Lining up: positioning a spreader to within 12 cm by eye is not practical, so — as on real RTGs with auto-positioning — when a movement button is let go, the crane coasts to a stop and then finishes on the nearest bay (or trailer position, when over the lane) and the nearest row. Inside the block every stop lands on a slot; beyond the block it stops where it is.
- Unavailable controls are greyed out with the reason on hover and in the hint line: Lock until the spreader rests squarely on a container of matching length, Release until the load rests in a slot or on a trailer position, spreader length while holding a container, and each direction at its limit (lower stops at whatever is underneath).
- Checked in the browser: with keys only, picked a 20ft from bay 17 row 01 and set it on the parked truck's centre position; with the mouse, holding "Forward" moved the gantry and letting go lined it up on the truck's front position. Automated tests repeat the pick-and-place using hold-and-let-go only.

### Review 2026-10-08
Reviewed at level quick, round 1, at commit bd70aee (ticket moved to review in 3aef2ff): the project's checks were carried from the worker's run and the change was read against the criteria. No browser or server was used.

- Checks: `test-run.sh --check 261008104607` answered SAME. The worker's run of `npm run build && npm test` (2026-10-08 12:06:05, fingerprint 0182c3313e20ca630dfc0d35474229442735b276) exited 0 on exactly this content, so it was not run again. `explain.sh check`: no explanation written (owner_explanation is off). The project has no CLAUDE.md or AGENTS.md. The work is on `main`; there is no separate branch for this ticket.
- Buttons move gantry, trolley and hoist both ways while held: met (read). Each axis has two buttons. Pressing one starts `jog` toward that end, and letting go, cancelling or losing the pointer calls `stopAndAlign`. `manual.test.ts` drives these same controller calls.
- Keyboard and the on-screen key list: met (read). A/D and the left/right arrows move the gantry, W/S and the up/down arrows move the trolley, F/R move the hoist. 2 and 4 set the spreader length, L locks, U releases. The keys are listening on `window`, and each one is shown in a `<kbd>` box next to its control.
- Spreader 20ft/40ft and lock/release buttons: met (read). The snap tests check that the stopping positions follow the spreader length.
- Readout: met (read). Each axis shows its position as `toFixed(2) m`. A Locked/Unlocked badge shows the lock state, and the "Over bay NN · row NN" line was checked against the bay numbering in `validBays` for both 20ft and 40ft.
- Pick from the block and place on a parked truck: met. The test "a person can pick a container … with hold-to-move only" passes in the carried run. It picks with hold-and-let-go only and finishes with the truck's load `{ centre20: '20GP' }`. When the hoist lands it sets target = position, so the crane counts as stopped and Lock becomes available.
- Unavailable controls shown as unavailable: met (read). Lock and Release are disabled using `canLock`/`canRelease`, which run the same checks as `lock()`/`release()`, and the reason shows on hover and in the hint line. The 20ft/40ft buttons are disabled while carrying. Each direction button is disabled at its limit, and for lowering the limit is whatever is underneath.

Notes (not blocking):
- If the browser window loses focus while a movement key is held, the key-up is never seen. That axis then keeps going to its end limit and does not line itself up.
- Letting go of a button calls `stopAndAlign` twice, once on pointer-up and once on lost-capture. This is harmless because both calls give the same result.

Not verified by running anything: the on-screen behaviour of buttons and keys in a real browser. These were judged by reading `CraneView.tsx`. The worker's notes say this was checked by hand, but a quick review does not repeat it.

### Suggested follow-up

- **A held movement key keeps the crane moving after the window loses focus.** If the operator switches tabs or windows while holding A, D, W, S, F or R, the crane drives on to its end limit, because the release of the key is never seen. Worth a ticket: on window blur, all held movements should stop and line up the same way as letting go.
