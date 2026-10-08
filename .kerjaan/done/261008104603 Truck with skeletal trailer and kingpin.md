---
type: feature
priority: high
review:
labels: [model, truck]
reporter: mirza
assign_to: claude
created: 2026-10-08 10:46:26
updated: 2026-10-08 11:20:24
related: [261008104602]
blocked_by: [261008104601, 261008104602]
---

## Background
Containers leave and arrive at the yard on trucks. A container truck has two
parts: the tractor (the cab with the engine) and the trailer, here a
"skeletal" trailer — a bare steel frame built only to carry containers. The
trailer hooks onto the tractor through a kingpin, a steel pin under the front
of the trailer that drops into a round coupling plate on the tractor (the
"fifth wheel"); the trailer pivots around this pin when the truck turns.

Containers are held on the trailer by twistlocks: small locks that fit into
the container's corner castings. A 40-foot skeletal trailer carries either one
20ft container, two 20ft containers, or one 40ft container (standard or High
Cube), so its twistlocks must sit in the right places for each case.

## Request
A tractor-and-trailer model in the reference style, with a visible kingpin and
fifth wheel, and a trailer that can carry each of the four loads: empty, one
20ft, two 20ft, or one 40ft (standard or High Cube), with each container
sitting exactly on its twistlocks.

## Done when
- [x] A view shows the truck in the reference's style, similar in feel to the trucks in the style reference
- [x] The kingpin and fifth wheel are visible and the trailer front sits on the fifth wheel
- [x] The truck can be shown empty, with one 20ft, with two 20ft, and with one 40ft or 40ft High Cube container, and a switch in the view changes between them
- [x] In every load, each container's corners sit on twistlock positions with no visible floating or overlap
- [x] A single 20ft load sits in the position a real terminal would use (stated in the Notes), not at a random spot
- [x] Asking the trailer for a load it cannot carry (for example three 20ft containers) is refused with a clear message instead of drawing something wrong

## History
- 2026-10-08 10:46:26 backlog
- 2026-10-08 10:57:35 todo
- 2026-10-08 11:14:40 in_progress
- 2026-10-08 11:18:11 review
- 2026-10-08 11:20:24 done

## Notes
- 2026-10-08 11:18:10: test run — `npm run build && npm test` exited 0 after 0m10s, on content fingerprint e90bcab0b8880ec3b90612e793473af011bc2a54 (the same before and after the run; .kerjaan/ left out).
- Open with the "Truck" tab (or `?view=truck`). Top: the coupled truck, its load switched from the panel at the bottom left. Front: the same trailer standing on its landing legs beside a tractor pulled forward, labelled kingpin, fifth wheel and landing legs. The kingpin hangs under the trailer's front plate, so orbit the camera low to see it.
- Single 20ft position: the centre of the trailer, on the middle twistlocks of a combination chassis. Centred, the weight is shared between the tractor's drive axles and the trailer's axles; a 20ft at either end would overload one of them. A pair of 20ft containers uses the front and rear positions, 76 mm apart.
- "Try an impossible load (3 × 20ft)" shows the refusal message; other refused combinations (40ft + 20ft, two 40ft, a 20ft in the 40ft position, overlapping positions) are covered by automated tests.
- One set of twistlocks serves every load; tests check that every corner casting of every legal load lands on a twistlock within 5 mm and that loads never overlap or overhang the deck.
- Built for the next tickets: tractor and trailer each have their own origin at the kingpin, and the truck takes an `articulation` angle (ticket 261008104604); single-slot checks (`canPlace`) let a crane put a 20ft pair down one at a time (ticket 261008104608).

### Review 2026-10-08

Reviewed at level quick, round 1, at commit 3bd8a3d (ticket moved to review in 1621646): the project's checks were carried from the worker's run and the change was read against the criteria. No escalation past quick.

- Checks: `test-run.sh --check 261008104603` answered SAME — the run of 2026-10-08 11:18:10 (`npm run build && npm test`, exit 0, fingerprint e90bcab0b8880ec3b90612e793473af011bc2a54) covered exactly this content, so it was not run again. The work is on `main` in this tree; no separate ticket branch exists. `explain.sh check`: no explanation (owner_explanation is off).
- Criterion 1 (style): judged by reading only. Tractor and trailer use the shared materials (blue brand cab, steel, amber twistlocks) and the existing stage, as the earlier views do. A headless Chrome screenshot of `?view=truck` showed the header and the "Trailer load" panel in the reference's card style, but the 3D canvas stayed blank — the same happens for the Containers view, so this is a limit of headless WebGL on this machine, not of the ticket. The 3D look itself was not seen.
- Criterion 2 (kingpin, fifth wheel): read in `spec.ts`, `Trailer.tsx`, `Tractor.tsx`. The trailer's front plate underside (`plateY`) equals the fifth wheel's top (`fifthWheelTopY`, 1.25 m), both origins coincide at the kingpin, and the kingpin hangs 8 cm below the plate into the coupling. The uncoupled pair in the view is labelled kingpin, fifth wheel and landing legs.
- Criterion 3 (load switch): the panel offers Empty, 1 × 20ft, 2 × 20ft, 1 × 40ft and 1 × 40ft HC (seen in the screenshot); each goes through `planLoad` into the shared store that the truck draws from.
- Criterion 4 (corners on twistlocks): covered by the test "every corner casting sits on a twistlock" for all four loaded cases (within 5 mm), and "stay on the deck and do not overlap"; the drawn containers use the same `placements()` and floor height `deckY` as the twistlock beams. Visual absence of floating was not seen (see criterion 1).
- Criterion 5 (single 20ft position): the centre position on a combination chassis, with the reason written in Notes (weight shared between drive and trailer axles); tested by "single 20ft goes in the centre position".
- Criterion 6 (refused loads): `planLoad` returns a reason for 3 × 20ft, 40ft + 20ft and two 40ft (tested); in the view a refusal shows a "Load refused." message and leaves the drawn load unchanged.

Decision: every criterion met — done.

Notes (non-blocking):
- The view opens with 2 × 20ft loaded rather than empty. Fine, just noting it.
