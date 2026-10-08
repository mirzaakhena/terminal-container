---
type: task
priority: high
review:
labels: [setup, scene, style]
reporter: mirza
assign_to: claude
created: 2026-10-08 10:46:25
updated: 2026-10-08 11:09:31
related: []
blocked_by: []
---

## Background
We are building a 3D "digital twin" of a container terminal yard: a live
picture of the yard that an operations person can look at, much like the
warehouse app in the style reference (docs/style-reference.png). Nothing exists
yet. Before any yard equipment can be drawn, the project needs a running web
page with an empty 3D world that already looks like the reference: a soft,
toy-like isometric view (seen from above at an angle, like a diorama), light
lavender-white ground, gentle shadows and the royal blue brand colour.

The agreed tools are a web app built with React and Three.js (a library for
drawing 3D in the browser) through its React layer, React Three Fiber. All 3D
objects will be built from simple shapes in code rather than drawn in a
separate 3D program, so sizes stay exact and the style stays consistent.

## Request
A web page that opens on an empty, styled 3D yard which the viewer can look
around, plus the project scaffolding every later piece of work will build on:
one place where colours and real-world sizes are defined, and an automated
check that the project still builds and its tests pass.

## Done when
- [x] Starting the project locally opens a page showing an empty ground area seen at an isometric angle
- [x] The ground, light and shadows look like the style reference when the two are placed side by side (light ground, soft shadows, no harsh black)
- [x] The viewer can zoom, rotate and pan the view with the mouse, and a "home" button returns to the starting view
- [x] Distances in the world are in real metres: a 10 m reference grid or ruler is visible and can be switched off
- [x] The project's check command (build and tests) runs and passes
- [x] A short README explains how to start the project and run the checks

## History
- 2026-10-08 10:46:25 backlog
- 2026-10-08 10:57:35 todo
- 2026-10-08 10:57:48 in_progress
- 2026-10-08 11:04:58 review
- 2026-10-08 11:09:31 done

## Notes
- 2026-10-08 11:04:48: test run — `npm run build && npm test` exited 0 after 0m11s, on content fingerprint c0ee6e65cbdfc4bf6abff070a67c8e044637d6ab (the same before and after the run; .kerjaan/ left out).
- Ground colour is drawn unlit (always exactly the palette's lavender-white) with a transparent shadow catcher on top, so shadows stay soft blue-grey rather than black. Checked with a temporary 40ft-sized box, removed again; the yard view ships empty.
- Start with `npm run dev`; the view can be switched later with `?view=<id>` (only "Yard" exists so far, so the view tabs stay hidden).
- Camera buttons: zoom ±, rotate 45° left/right, home, grid/ruler toggle. Mouse: left-drag rotate, right-drag pan, scroll zoom.

### Review 2026-10-08 (independent reviewer)
- Reviewed at level quick (the ticket sets no level), round 1, at commit 841d38c (board commit 6d0d31b on top): the project's checks were carried from the worker's run, and the change was read against the criteria. I went past quick on criteria 1 to 4: these are about what a person sees and does in the browser, which reading the code cannot settle, so I opened the running page (http://localhost:5173) in a scripted Chromium browser, used the mouse and buttons, and took screenshots.
- Checks: `test-run.sh --check 261008104601` answered SAME. The worker's run of `npm run build && npm test` (2026-10-08 11:04:48, fingerprint c0ee6e65cbdfc4bf6abff070a67c8e044637d6ab, exit 0) covers exactly this content, so it was not run again. `explain.sh check`: no explanation (owner_explanation is off).
- The repo has no CLAUDE.md or AGENTS.md, so no project rules apply beyond the ticket.
- Criterion 1 (empty ground at an isometric angle): met. The page opens on an empty lavender-white ground seen from above at an angle (unit test puts the home view between 30 and 40 degrees above the ground). Only the grid and the 10 m ruler are drawn.
- Criterion 2 (looks like the reference): met, compared side by side with docs/style-reference.png. Ground and background are light lavender-white, the ruler is the reference's royal blue, and the right-hand button strip matches the reference's zoom, rotate and home buttons. Shadows: the yard is empty, so no shadow shows on the page. Judged from the code (a shadow layer at 22% opacity in blue-grey `#3a4580`, soft shadow maps, strong fill light), plus the worker's own screenshot with a temporary box (.playwright-mcp/s05.png), which shows a soft grey-blue shadow rather than black.
- Criterion 3 (zoom, rotate, pan, home): met. Scroll zoomed in, left-drag rotated, right-drag panned. Each one changed the picture, and the Home button then gave back a picture where the ruler sat at exactly the same pixel position as at first load (404,516 to 580,630).
- Criterion 4 (real metres, 10 m grid/ruler, can be switched off): met. A 10 m grid with 50 m section lines and a 10 m ruler with 1 m ticks are drawn in one-unit-per-metre space (`units.ts`, unit-tested). The grid button hid both (aria-pressed went to false, screenshot shows an empty ground).
- Criterion 5 (check command passes): met, carried from the worker's run (see above).
- Criterion 6 (README): met. README.md explains `npm install`, `npm run dev`, the camera controls and `npm run build && npm test`.
- Branch: no separate branch for this ticket. The work is on the current branch.
- Notes (not blocking):
  - `tsconfig.tsbuildinfo` is committed. It is a build artifact that changes on every build, so it probably belongs in `.gitignore`.
  - The automated tests cover the camera maths and unit conversion only. Nothing tests the buttons, the grid toggle or the rendering, so criteria 3 and 4 rest on this review's browser check.
  - Plain headless Chrome with software WebGL left most grid lines out of the picture. With GPU rendering (Playwright Chromium) they all showed. This is a rendering quirk of that environment, not an app bug.

### Suggested follow-up

- **No automated check covers the camera buttons and the grid toggle.** Today only camera maths is tested, so a broken Home or grid button would still pass `npm test`. Worth a ticket: a small browser test (for example Playwright against `vite preview`) that loads the page, presses Home and the grid button, and checks the result.
