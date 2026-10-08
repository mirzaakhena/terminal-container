---
type: feature
priority: high
review:
labels: [model, container]
reporter: mirza
assign_to: claude
created: 2026-10-08 10:46:26
updated: 2026-10-08 11:12:40
related: []
blocked_by: [261008104601]
---

## Background
Shipping containers come in standard sizes set by an international standard
(ISO). This terminal handles three: the 20-foot container (about 6.06 m
long), the 40-foot container (about 12.19 m long), both 2.59 m tall, and the
40-foot "High Cube", which is one foot taller (2.90 m). All are 2.44 m wide.

Every other piece of equipment — truck, storage block, crane — is sized around
these boxes, so they come first. At each top and bottom corner a container has
a "corner casting", a steel block with holes that cranes and trucks lock onto.

## Request
Three container models true to real dimensions, in the soft low-poly style of
the reference, with visible corner castings and doors at one end, and a choice
of pastel colours that do not copy any real shipping company's branding.

## Done when
- [x] A page or view shows a 20ft, a 40ft and a 40ft High Cube container side by side
- [x] Their lengths, widths and heights match the ISO sizes above to within 1 cm (shown in a size label or checked by an automated test)
- [x] Two 20ft containers placed end to end are as long as one 40ft container, within the small standard gap
- [x] The High Cube is visibly taller than the standard 40ft
- [x] Corner castings and door ends are visible on each container
- [x] Containers can be shown in at least five different pastel colours, none carrying a real company's logo

## History
- 2026-10-08 10:46:26 backlog
- 2026-10-08 10:57:35 todo
- 2026-10-08 11:10:14 in_progress
- 2026-10-08 11:12:40 review

## Notes
- 2026-10-08 11:12:39: test run — `npm run build && npm test` exited 0 after 0m11s, on content fingerprint f8b01c5e63c763a847710067f6426ff7549d440b (the same before and after the run; .kerjaan/ left out).
- Open the showroom with the "Containers" tab in the header (or `?view=containers`). Rows: 20ft, 40ft, 40ft High Cube with size tags; a 20ft pair end to end beside a 40ft; a column of one 20ft per palette colour (8 colours).
- Sizes follow ISO 668 (20ft 6.058 m, 40ft 12.192 m, width 2.438 m, height 2.591 m / HC 2.896 m) and the 76 mm pair gap; corner-fitting centres follow ISO 1161 so the truck and crane can lock onto them. Automated tests check every size, the pair length and that each drawn model fits its ISO box within 1 cm.
- Doors are at the +X end of each container; door hardware is kept inside the ISO length.
- Each container is two merged meshes (body and trim) with geometry shared per type, so a full yard stays cheap to draw.
- Also untracked `tsconfig.tsbuildinfo` (reviewer's note on 261008104601) and moved the 10 m ruler out from under the showroom.
