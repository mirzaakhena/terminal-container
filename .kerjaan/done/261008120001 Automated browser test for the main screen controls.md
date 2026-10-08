---
type: task
priority: low
review:
labels: [testing, ui]
reporter: mirza
assign_to: claude
created: 2026-10-08 12:00:21
updated: 2026-10-08 12:55:54
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
- 2026-10-08 12:55:11 review
- 2026-10-08 12:55:54 done

## Notes
- 2026-10-08 12:54:58: test run — `npm run build && npm test && npm run test:e2e` exited 0 after 0m46s, on content fingerprint 767ec8f5c5542541a113bd1dd7d4fd6cf9716023 (the same before and after the run; .kerjaan/ left out).
- The board's check command is now `npm run build && npm test && npm run test:e2e`; the last part starts its own copy of the app (port 5199) and drives it in headless Chromium with software graphics, so no graphics card or open browser is needed. A full check takes about 45 seconds.
- Browser cases (`e2e/controls.spec.ts`): Zoom in, Zoom out, Rotate left/right (45° each, opposite ways), Home view (back to the start after zooming and rotating), the grid button (grid and ruler hidden and shown again, button state follows), and every header tab opening its view with its content and no page errors.
- Breaking buttons on purpose: with Zoom in made to do nothing and the grid button disconnected, the check failed on exactly those cases with "\"Zoom in\" did not bring the camera closer" and "grid button did not switch off when clicked" (Home view failed too, since it uses Zoom in to move away first). Restored afterwards.
- To see inside the app, the development build now also exposes the camera (`__porttrack.camera`) and the 3D scene (`__porttrack.scene`); the grid and ruler have names in the scene so a test can tell whether they are shown.
- README "Checks" says how to install Playwright's Chromium once (`npx playwright install chromium`) and how to run the browser check on its own or watch it with `-- --headed`.

### Review 2026-10-08
Reviewed at level quick, round 1, at commit f4c62fe: the project's checks were not run again because they were carried from the worker's run, and the change was read against each criterion. No browser was started by the reviewer and nothing was broken on purpose.

- Checks: `test-run.sh --check 261008120001` answered SAME. The worker's run of 2026-10-08 12:54:58 (`npm run build && npm test && npm run test:e2e`, exit 0, fingerprint 767ec8f5c5542541a113bd1dd7d4fd6cf9716023) covered exactly the content under review, so it counts as this review's run. No separate branch exists for this ticket; the work is on the main tree.
- Criterion 1 (checks open the app in a browser): met. `test_command` and the README now end with `npm run test:e2e` (`playwright test`), and `playwright.config.ts` starts its own dev server on port 5199 (`--strictPort`, `reuseExistingServer: false`) and runs headless Chromium. The carried run includes this step and exited 0.
- Criterion 2 (zoom, rotate, home): met. `e2e/controls.spec.ts` reads the real camera position and target through `__porttrack.camera`. Zoom in/out must change the distance by more than 10%, each rotate must turn by about 45° and the two must go opposite ways, and Home must bring the camera back within 0.1 on each axis after a zoom and a rotate.
- Criterion 3 (grid and ruler): met. The test checks the button state and whether the named `reference-grid` and `scale-ruler` objects are in the 3D scene, before and after one click, and that the grid comes back after a second click.
- Criterion 4 (each view from the header): met. All six header tabs are clicked; each must change the address, show text from that view, and show the 3D canvas. Page errors and console errors are collected and must be empty at the end.
- Criterion 5 (a broken button gives a failure naming it): met, judged by reading. Every assertion compares state the app actually produced (camera numbers, scene objects, `aria-pressed`, the address), not fixed values, and each failure message names its button or tab. The worker's own breakage experiment is described in Notes, but the reviewer did not repeat it.
- Criterion 6 (README): met. README "Checks" names Playwright's Chromium, the one-time `npx playwright install chromium`, `npm run test:e2e` on its own, and `-- --headed`.
- The camera and scene handles are only added in development builds (`import.meta.env.DEV`), so production builds are unchanged. The project has no CLAUDE.md or AGENTS.md, so no written project rules applied.

Non-blocking notes:
- The second grid click checks only that the grid comes back, not the ruler.
- The Home test compares camera position only, not the point the camera looks at. A Home button that restored the position but left the view aimed somewhere else would still pass.

### Suggested follow-up

- **The Home view browser test does not check where the camera is looking.** It only checks that the camera's position comes back. If Home ever restored the position but left the view aimed elsewhere, the check would stay green. Worth a small ticket: the test should also compare the camera's look-at point, and check the ruler as well as the grid when the grid is switched back on.
