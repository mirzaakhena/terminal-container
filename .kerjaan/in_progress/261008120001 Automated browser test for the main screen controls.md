---
type: task
priority: low
review:
labels: [testing, ui]
reporter: mirza
assign_to: claude
created: 2026-10-08 12:00:21
updated: 2026-10-08 12:54:58
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
- [x] Running the project's checks also opens the app in a browser and tests it, without anyone touching it
- [x] The check confirms that zoom, rotate and home change the view, and home brings it back to the starting view
- [x] The check confirms that the grid button hides and shows the grid and ruler
- [x] The check opens each view from the header and confirms it shows without errors
- [x] Breaking one of these buttons on purpose makes the check fail with a message naming that button
- [x] The README says what the browser check needs installed and how to run it on its own

## History
- 2026-10-08 12:00:21 backlog
- 2026-10-08 12:50:16 todo
- 2026-10-08 12:50:24 in_progress

## Notes
- 2026-10-08 12:54:58: test run — `npm run build && npm test && npm run test:e2e` exited 0 after 0m46s, on content fingerprint 767ec8f5c5542541a113bd1dd7d4fd6cf9716023 (the same before and after the run; .kerjaan/ left out).
- The board's check command is now `npm run build && npm test && npm run test:e2e`; the last part starts its own copy of the app (port 5199) and drives it in headless Chromium with software graphics, so no graphics card or open browser is needed. A full check takes about 45 seconds.
- Browser cases (`e2e/controls.spec.ts`): Zoom in, Zoom out, Rotate left/right (45° each, opposite ways), Home view (back to the start after zooming and rotating), the grid button (grid and ruler hidden and shown again, button state follows), and every header tab opening its view with its content and no page errors.
- Breaking buttons on purpose: with Zoom in made to do nothing and the grid button disconnected, the check failed on exactly those cases with "\"Zoom in\" did not bring the camera closer" and "grid button did not switch off when clicked" (Home view failed too, since it uses Zoom in to move away first). Restored afterwards.
- To see inside the app, the development build now also exposes the camera (`__porttrack.camera`) and the 3D scene (`__porttrack.scene`); the grid and ruler have names in the scene so a test can tell whether they are shown.
- README "Checks" says how to install Playwright's Chromium once (`npx playwright install chromium`) and how to run the browser check on its own or watch it with `-- --headed`.
