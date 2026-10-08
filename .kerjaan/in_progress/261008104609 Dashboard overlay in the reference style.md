---
type: feature
priority: low
review:
labels: [ui, dashboard]
reporter: mirza
assign_to: claude
created: 2026-10-08 10:46:26
updated: 2026-10-08 12:21:27
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
