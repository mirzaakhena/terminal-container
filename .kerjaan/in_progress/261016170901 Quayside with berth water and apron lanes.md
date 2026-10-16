---
type: feature
priority: high
review:
labels: [quay, scene]
reporter: mirza
assign_to: claude
created: 2026-10-16 17:09:47
updated: 2026-10-16 20:17:52
related: []
blocked_by: []
---

## Background
So far the terminal is all on land: a storage block with its yard crane, a
truck lane and a gate. A container terminal exists to serve ships, so it also
needs a quayside: the edge of the land where ships tie up (the berth), the
water beyond it, and the paved strip along the edge (the apron) where trucks
wait under the quay crane while containers are lifted on or off the ship.
Nothing on the quayside exists yet.

## Request
The Yard view shows a quayside next to the existing yard: a straight quay
edge with water beyond it, running along the block's long side away from the
gate road (so the block sits between the gate road and the apron), a berth
where a ship can tie up, whose length follows the ship's size (ship length plus
about 25 m at each end), and apron lanes along the quay for trucks, placed
where they will run between the quay crane's legs, with the strip behind the
landside legs kept free for hatch covers later. The lanes join the existing
roads so a truck can drive from the gate to the quay and on to the yard block.

## Done when
- [x] The Yard view shows a quay edge with water on the far side, in the same soft style as the rest of the scene
- [x] The berth is marked on the quay (bollards along the edge, berth name and length shown)
- [x] At least one apron truck lane runs along the quay, painted like the yard's lanes, in the strip the quay crane's legs will straddle
- [x] A road joins the apron to the existing gate road and the yard block's lane, and a truck can drive from the gate along the apron to the yard and out, shown by a demo drive
- [x] The quay runs along the block's long side, away from the gate road, and the quay, berth and apron do not overlap the yard block, its crane or its lane
- [x] The home view still shows the yard block clearly, with the quayside in frame

## History
- 2026-10-16 17:09:47 backlog
- 2026-10-16 17:47:07 todo
- 2026-10-16 18:15:58 in_progress

## Notes
- 2026-10-16 17:19:03: answered question: Where does the quay sit relative to Block A? (a) Along the block's long side, on the side away from the gate road, so the block sits between the gate road and the apron, as at most real terminals; (b) past the far end of the block; (c) the worker chooses. Recommended: (a). The quay and the block then run in the same direction, and a truck goes gate, block lane, round the block's end, apron.
  answer, 2026-10-16 17:46:29: (a) Along the block's long side, away from the gate road, so the block sits between the gate road and the apron. (mirza: "setuju semua rekomendasi")
- 2026-10-16 17:19:03: answered question: Where are the apron truck lanes: (a) between the quay crane's legs, as at most real terminals, with the space behind the landside legs (the backreach) kept for hatch covers later (261016170909); or (b) behind the landside legs, as 261016170904's Background says now? Recommended: (a). The quay crane ticket's wording is then changed to match. This decides where 901 paints the lanes and how far 904's trolley has to reach.
  answer, 2026-10-16 17:46:30: (a) Apron truck lanes between the quay crane's legs, keeping the space behind the landside legs for hatch covers later; 261016170904's wording is changed to match. (mirza: "setuju semua rekomendasi")
- 2026-10-16 17:19:04: answered question: Is the berth a fixed length, or does it follow the ship? (a) The quay and berth grow and shrink with the ship's size setting (ship length plus about 25 m at each end), so a feeder does not lie at a long empty quay and a big ship always fits; (b) a fixed berth of about 300 m, and the ship setting refuses sizes that do not fit; (c) a fixed 400 m quay that fits even the largest ships. Recommended: (a). The default feeder keeps the scene compact, and the ship view can still show a giant.
  answer, 2026-10-16 17:46:30: (a) The quay and berth follow the ship's size setting: ship length plus about 25 m at each end. (mirza: "setuju semua rekomendasi")
- 2026-10-16 17:19:19: answered question: For all nine tickets: the look-and-feel lines ("in the same soft style", "the home view still shows the yard block clearly", "a believable mix") are, as in the last chain, checked by the reviewer in a real browser with screenshots against the style reference. Do you also want to look yourself? (a) No, the reviewer's browser check is enough; (b) deferred: the work goes on, and each such line waits for you with a hand scenario in Notes; (c) holds: the chain stops at the ticket until you have looked. Recommended: (a). It worked for the last 14 tickets, and none of these lines needs a phone or a day of real use.
  answer, 2026-10-16 17:46:30: (a) The reviewer's browser check with screenshots is enough for the look-and-feel lines in all nine tickets; no owner check, nothing deferred. (mirza: "setuju semua rekomendasi")
- 2026-10-16 17:19:34: files estimated to change: `src/config/theme.ts`, `src/models/quay/`, `src/scene/Ground.tsx`, `src/sim/jobs.test.ts`, `src/sim/jobs.ts`, `src/views/YardView.tsx`, `src/views/index.ts`
- 2026-10-16 18:55:00: worker report.
  Built: `src/models/quay/layout.ts` (`quayLayout`: berth = ship + 25 m each end, centred; across the quay from land to water: backreach 15 m, landside rail, 4 apron lanes of 4.5 m between the rails with at least 4.5 m clear of each rail, waterside rail at 30.48 m gauge, edge 3 m beyond; bollards every ~20 m from end to end; road connectors 12.5 m in from each quay end, moved out further only if the yard crane or the yard entry corner would be in the way), `src/models/quay/terminal.ts` (`yardQuay(block, shipLength)`: the quay for a block, 6 m past the yard crane's furthest part, on the side away from the lane and gate road), `src/models/quay/Quayside.tsx` (drawing). The ground takes a `shoreZ` per view: land ends in a straight shore with water 1.6 m below. `quayTourRoute` in `src/sim/jobs.ts` and `JobRunner.tour(route)`: a demo drive gate → east along the gate road → north up the east connector → west along apron lane 1 → south down the west connector → east along the block lane → exit. "Demo drive via quay" button in the Yard jobs panel; refused while a truck is on site, jobs are waiting or the queue is paused; jobs queued meanwhile wait until it has left; the crane is raised before the truck drives under it. The Yard home view moved back to 200 m and the yard sits 14 m further from the camera target, so the quay is in frame.
  Choices worth knowing for later tickets: apron lane 1 is the one nearest the land, numbers rise toward the water (905's "apron lane 1" readout); the apron is driven westbound so trucks enter the block lane eastbound as the yard jobs expect; the roads join the apron inside the 25 m free ends, so nothing crosses the backreach beside the ship; the backreach outline is painted over the ship's length only. Layout data reachable for later tickets as `QUAY`/`YARD_ORIGIN`/`YARD_SHORE_Z` in `src/views/YardView.tsx` and `__porttrack.yard.layout` in development.
  Non-blocking question for the owner: lane numbering from the land side was my choice (some terminals count from the water); say if you want it the other way.
  Tests that go red when broken (each broken on purpose, then restored from a copy): tour() without the paused / truck-on-site / jobs-waiting refusal, and tick() without the touring wait — each turns "is refused while a truck is on site, jobs are waiting or the queue is paused" red; tour() without raising the crane turns "the crane stays raised clear of it the whole way" red (spreader at 1 m over the truck at x=-28.5); quayLayout without the west or the east keepClear shift, or without extending the apron to the connectors — "lies along the block's long side" and "joins the roads to the apron …" red; yardQuay without the entry-corner clearance — "joins the roads …" red; yardQuay with no keepClear at all — 4 red across quay and job tests; quay starting at the block edge instead of past the crane — 6 red; Yard view without `shoreZ` — browser test "water is missing"; without `<Quayside>` — browser test "quayside is missing".
  Measured in the browser (screenshots): home view with the block in the middle and the quay, berth label, bollards and water behind it; a demo truck on apron lane 1 heading west; the quay edge from the water side with coping, fenders and bollards.
- 2026-10-16 18:58:50: test run — `npm run build && npm test && npm run test:e2e` exited 1 after 8m28s, on content fingerprint a937e92b8c2d8dd22919075ea991daeb3d0679e8 (the same before and after the run; .kerjaan/ left out).
- 2026-10-16 19:40:28: test run — `npm run build && npm test && npm run test:e2e` exited 1 after 5m21s, on content fingerprint a937e92b8c2d8dd22919075ea991daeb3d0679e8 (the same before and after the run; .kerjaan/ left out).
- 2026-10-16 20:05:00: test runs red only on the Crane view's timing tests (`e2e/crane.spec.ts`: "held key / held button / hidden tab lets go", "letting go normally lines up on a bay" — "the crane kept moving instead of stopping" within 30 s). Build, all 115 unit tests and every other browser test pass, including the new `e2e/quay.spec.ts`. The machine was under heavy load from other projects the whole time (load average 20–200: other Playwright suites, `yes` processes, flutter tests), and the headless browser ran at 0.1–4 frames a second; the Crane view steps its crane at most 0.1 s per frame, so it cannot stop within 30 s. The unchanged HEAD fails the same tests under the same load (2 of 4, then 1 of 4, in a clean worktree of be4655f), and the Crane view's frame rate measured the same for HEAD and this change. This ticket does not touch the Crane view or its controller. Needs a rerun of `test-run.sh` on a quieter machine.
- 2026-10-16 20:17:51: test run — `npm run build && npm test && npm run test:e2e` exited 0 after 2m15s, on content fingerprint a937e92b8c2d8dd22919075ea991daeb3d0679e8 (the same before and after the run; .kerjaan/ left out).
- 2026-10-16 20:18:30: rerun once the machine had quietened (load average about 8): `test-run.sh` exited 0, all 15 browser tests passed, including the four Crane view timing tests, on the same content fingerprint a937e92b. That settles the red runs above as load, not this change.
