---
type: feature
priority: high
review:
labels: [quay, scene]
reporter: mirza
assign_to: claude
created: 2026-10-16 17:09:47
updated: 2026-10-16 17:47:07
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
- [ ] The Yard view shows a quay edge with water on the far side, in the same soft style as the rest of the scene
- [ ] The berth is marked on the quay (bollards along the edge, berth name and length shown)
- [ ] At least one apron truck lane runs along the quay, painted like the yard's lanes, in the strip the quay crane's legs will straddle
- [ ] A road joins the apron to the existing gate road and the yard block's lane, and a truck can drive from the gate along the apron to the yard and out, shown by a demo drive
- [ ] The quay runs along the block's long side, away from the gate road, and the quay, berth and apron do not overlap the yard block, its crane or its lane
- [ ] The home view still shows the yard block clearly, with the quayside in frame

## History
- 2026-10-16 17:09:47 backlog
- 2026-10-16 17:47:07 todo

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
