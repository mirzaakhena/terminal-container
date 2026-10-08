---
type: task
priority: low
review:
labels: [testing, ui]
reporter: mirza
assign_to: claude
created: 2026-10-08 12:00:21
updated: 2026-10-08 12:00:41
related: [261008104601]
blocked_by: []
---

## Background
The project's automatic checks test the calculations behind the scene: sizes,
positions, crane and truck movement. Nothing checks the buttons on screen.
If the camera's zoom or home button, the grid switch or a view's panel stopped
working, every check would still pass and nobody would notice until they
tried it by hand. The reviewer of the first ticket pointed this out.

## Request
An automatic check that opens the app in a real browser, presses the main
controls and confirms each one did what it should, run as part of the
project's normal checks.

## Done when
- [ ] Running the project's checks also opens the app in a browser and tests it, without anyone touching it
- [ ] The check confirms that zoom, rotate and home change the view, and home brings it back to the starting view
- [ ] The check confirms that the grid button hides and shows the grid and ruler
- [ ] The check opens each view from the header and confirms it shows without errors
- [ ] Breaking one of these buttons on purpose makes the check fail with a message naming that button
- [ ] The README says what the browser check needs installed and how to run it on its own

## History
- 2026-10-08 12:00:21 backlog

## Notes
(none yet)
