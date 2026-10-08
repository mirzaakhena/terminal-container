---
type: feature
priority: low
review:
labels: [ui, dashboard]
reporter: mirza
assign_to: claude
created: 2026-10-08 10:46:26
updated: 2026-10-08 12:30:59
related: [261008104608]
blocked_by: [261008104601]
---

## Background
The style reference is more than a 3D picture: floating white cards around
the scene show headline numbers, the selected site's details, the progress of
a shipment, and a table of equipment. That overlay is what makes the scene an
operations tool. For now its numbers can come from made-up sample data; the
working app name is "PortTrack".

## Request
An overlay in the reference's layout and style — header, headline number
cards, a detail panel, a job progress strip, an equipment table and camera
buttons — filled with sample terminal data, that stays readable on top of the
3D scene.

## Done when
- [x] A header shows the "PortTrack" name, a search box, a site picker, a live clock and a user badge
- [x] Top-left cards show at least three yard figures (for example containers in yard, trucks on site, crane moves per hour) from sample data
- [x] A right-hand panel shows details of the selected block or crane, and clicking a block or crane in the scene changes it
- [x] A bottom strip shows the steps of the current or a sample job as a progress timeline
- [x] A table lists cranes and trucks with their status
- [x] Zoom, rotate and home camera buttons sit at the edge of the scene like in the reference
- [x] Placed side by side with the style reference, colours, rounded corners and spacing look like the same family

## History
- 2026-10-08 10:46:26 backlog
- 2026-10-08 12:00:41 todo
- 2026-10-08 12:14:46 in_progress
- 2026-10-08 12:21:27 review
- 2026-10-08 12:30:59 done

## Notes
- 2026-10-08 12:21:27: test run — `npm run build && npm test` exited 0 after 0m13s, on content fingerprint 0f6856e7be14f973e9c07f0dad22681bf8c8b146 (the same before and after the run; .kerjaan/ left out).
- The overlay sits on the "Yard" tab and reads the live yard, not made-up numbers: queue jobs (Crane jobs → Show → Queue demo jobs, 10×) and the figures, timeline and table move with them. Before any job runs, the timeline shows a sample job.
- Header (on every tab): PortTrack logo, view tabs, a search box (type part of a container number and press Enter — the detail panel shows that container, its address and whether it is buried; "/" focuses it), a site picker showing Block A's fill, a Live clock, notifications and a user badge ("Yard Planner", a role rather than a person). On narrower windows the secondary text folds away.
- Top-left cards: containers in yard (with TEU and fill), trucks on site, crane moves per hour of yard time, jobs done/queued.
- Right panel: Block A (TEU fill, boxes, 20ft vs 40ft/HC counts, how many are reachable) or RTG-01 (idle/working with the current step, gantry and hoist position, spreader length, what it holds). Clicking the block or the crane in the scene switches it (hand cursor on hover); tabs at the top do the same.
- Bottom strip "Job Tracking": the running job (or the last finished one) through Queued → Truck arriving → Crane working → Truck leaving → Done, each with its yard-clock time (the yard clock starts at 08:00), plus the containers and the current step.
- Bottom-right table with Cranes / Trucks tabs: RTG-01 with its job and progress; the latest four trucks with load, status (At gate, Arriving, Loading/Unloading, Leaving, Left) and moves done.
- Camera buttons sit at the edge of the scene beside the detail panel, as in the reference.
- The job form from 261008104608 moved to a foldable card under the headline cards and starts folded.

### Review 2026-10-08

Reviewed at level quick (the ticket sets no level), round 1, at commit 22eb4cd: the project's checks were carried from the worker's run and the change was read against the criteria. I went past quick on criteria 3 and 7, because a click in the 3D scene and a visual likeness cannot be settled by reading code. For those two I opened the running app in a browser (Playwright with GPU rendering, 1600×930, `http://localhost:5173/?view=yard`), clicked it and took screenshots.

- Checks: `test-run.sh --check 261008104609` answered SAME. The worker's `npm run build && npm test` (exit 0, 2026-10-08 12:21:27, fingerprint 0f6856e7be14f973e9c07f0dad22681bf8c8b146) covers exactly this content, so it was not run again.
- `explain.sh check`: no explanation written; `owner_explanation` is `off`.
- The project has no CLAUDE.md or AGENTS.md, so no project rules apply.
- The work sits on the main line in this tree (no ticket branch).

Criteria:
1. Header: met. The page shows "PortTrack", the view tabs, the search box ("Search containers, trucks, cranes…", `/` hint), the site picker "CY-01 Block A · RTG-01, 33% full · 100/300 TEU", "Live 12:22" and the "YP Yard Planner" badge. Searching part of a container number showed that container in the panel (address, buried or reachable); an unknown number showed "Not in the yard".
2. Headline cards: met. Four cards: containers in yard 62 (100 TEU · 33%), trucks on site, crane moves / hour, jobs. At 10× speed they moved with the jobs (60 containers, 30.2 moves/hour, 1/4 jobs done).
3. Detail panel and scene clicks: met. In the browser, clicking a crane leg, the crane's top beam (at its projected screen position) or the trolley switched the panel to RTG-01; clicking the containers switched it back to Block A; clicking empty ground left it unchanged. The hand cursor shows over both. Clicks that land in the gap between the crane's two thin top girders do nothing, which is expected.
4. Bottom strip: met. Before any job it shows a sample. With jobs running it shows JOB-001 at "Crane working" with step times and the containers, then JOB-002 at "Truck arriving".
5. Equipment table: met. A Trucks tab lists the four trucks (At gate / Arriving / Loading / Left, moves 2/2); a Cranes tab lists RTG-01 Working with its job.
6. Camera buttons: met. Zoom in/out, rotate left/right, home and grid sit in a vertical strip at the scene's edge, beside the detail panel, as in the reference.
7. Style: met, judged by eye. Next to `docs/style-reference.png` the screenshots share the look: white rounded cards on a pale blue-grey scene, a blue accent, green "Operational"/"Live" pills, the same placement (headline cards top-left, detail card right, tracking strip bottom-left, tabbed table bottom-right) and similar spacing.

Notes (not blocking):
- The site picker and the bell look like buttons but do nothing when clicked. That is fine for sample data, but someone may expect them to open something.
- The live clock refreshes every 15 seconds, so it can show the previous minute for up to 15 seconds.
- Below 1100 px wide, the detail panel and the equipment table are hidden.
- The only new automated tests cover the figures (`yardStats.test.ts`). The overlay and the scene clicks have no automated test; they were checked by hand in this review.

### Suggested follow-up

- **The site picker and the notification bell do nothing when clicked.** Both look clickable in the header, like in the reference, but they are decoration only. Worth a ticket once there is more than one block or real alerts: the picker should switch the block being shown, and the bell should list events such as finished or failed jobs.
