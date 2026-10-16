---
type: feature
priority: medium
review:
labels: [quay-crane, jobs, simulation]
reporter: mirza
assign_to: claude
created: 2026-10-16 17:09:52
updated: 2026-10-16 17:47:08
related: [261016170905, 261008104608]
blocked_by: [261016170903, 261016170904, 261016170905]
---

## Background
When a ship calls, the quay crane works through a list of moves:
"discharge" moves take containers off the ship onto trucks waiting on the
apron, and "load" moves take containers from trucks onto the ship. The yard
crane already works this way for the block, with a checked queue, automatic
moves, trucks driving in and out, and recovery when a job cannot finish.

## Request
Quay crane jobs can be queued that make a truck drive onto the apron, the
quay crane move a container between that truck and a chosen ship address, and
the truck drive off — for discharge and load, 1 × 20ft, 2 × 20ft and 1 × 40ft —
checked before they start and recovered like yard jobs when they cannot finish.
The jobs are queued in the Yard view's existing jobs panel, under a "Yard
crane / Quay crane" switch. Quay and yard jobs take turns: one truck on site in
the whole terminal at a time (261010010201 can lift this later).

## Done when
- [ ] A discharge job takes a container from a chosen ship address and puts it on a truck that drove onto the apron, and the truck drives off with it
- [ ] A load job takes a container off an arriving truck and stows it at a chosen free ship address
- [ ] A 2 × 20ft job fills or empties both trailer positions, one after the other
- [ ] Jobs that cannot be done (container buried, slot taken or in mid-air, wrong load) are refused before they start, with the reason
- [ ] Several jobs run one after another on their own, taking turns with yard jobs so there is never more than one truck on site; a job that stops partway pauses the queue and is recovered as in the yard
- [ ] Nothing ever passes through anything (checked automatically at every step), and the boom is down whenever the crane works
- [ ] The Yard view's jobs panel has a "Yard crane / Quay crane" switch; under Quay crane it queues jobs with "Pick for me", demo jobs and the 1× / 4× / 10× speeds, like the yard's

## History
- 2026-10-16 17:09:52 backlog
- 2026-10-16 17:47:08 todo

## Notes
- Planner, 2026-10-16: added 261016170905 to blocked_by. Taking a container off the ship and setting it on a truck, and lining up on ship bays and rows, are built in the manual controls ticket; these jobs drive the crane through the same steps, as the yard jobs (261008104608) came after the yard crane's manual controls (261008104607). Built side by side, both would write the ship pick-up and set-down twice.
- 2026-10-16 17:19:06: answered question: Where is the quay crane jobs panel? (a) In the Yard view, in the same jobs panel as the yard crane, with a switch between "Yard crane" and "Quay crane"; (b) a second panel in the Yard view; (c) a view of its own. Recommended: (a). The Yard view stays uncluttered beside the dashboard, and the end-to-end jobs (261016170907) and the dashboard (261016170908) work in the same scene.
  answer, 2026-10-16 17:46:31: (a) In the Yard view's existing jobs panel, with a "Yard crane / Quay crane" switch. (mirza: "setuju semua rekomendasi")
- 2026-10-16 17:19:07: answered question: May quay crane jobs and yard crane jobs run at the same time? Each queue can have one truck on site, and nothing yet keeps two driving trucks from passing through each other (that is 261010010201, multi-truck, which is still in backlog). (a) They take turns: one truck on site in the whole terminal at a time, and a queued job waits until the other crane's truck has left; (b) at the same time, which first needs 261010010201 or separate roads for each crane. Recommended: (a), for now. It needs nothing else from the backlog, and the multi-truck ticket can lift it later.
  answer, 2026-10-16 17:46:31: (a) They take turns for now: one truck on site in the whole terminal at a time; 261010010201 can lift this later. (mirza: "setuju semua rekomendasi")
- 2026-10-16 17:19:42: files estimated to change: `README.md`, `src/sim/jobs.ts`, `src/sim/quayJobs.test.ts`, `src/sim/quayJobs.ts`, `src/sim/world.ts`, `src/styles.css`, `src/views/YardView.tsx`
- Decision by mirza, 2026-10-16 (261016170901 question 4, for all nine tickets): the look-and-feel lines are checked by the reviewer in a browser with screenshots; no owner check, nothing deferred.
