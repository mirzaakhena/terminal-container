---
type: feature
priority: low
review:
labels: [ui, dashboard]
reporter: mirza
assign_to: claude
created: 2026-10-08 12:49:49
updated: 2026-10-08 13:32:19
related: [261008104609]
blocked_by: []
---

## Background
The dashboard header has a site picker ("CY-01 · Block A · RTG-01") and a
notifications bell, styled as buttons like in the reference. Today neither
does anything when clicked: there is only one block, and nothing produces
notifications. The reviewer of the dashboard ticket pointed this out.

## Request
The site picker and the bell do something useful: the picker lists the
yard's blocks and shows which one the dashboard is about, and the bell lists
recent events such as jobs finished, refused or stopped, with a count of
unread ones.

## Done when
- [x] Clicking the site picker opens a list of the yard's blocks, with the current one marked
- [x] Clicking the bell opens a list of recent job events, newest first, each with its time
- [x] The red dot on the bell only shows when there are events not yet seen, and opening the list clears it
- [x] Both lists close when clicking elsewhere or pressing Escape

## History
- 2026-10-08 12:49:49 backlog
- 2026-10-08 13:26:18 todo
- 2026-10-08 13:26:18 in_progress
- 2026-10-08 13:32:19 review

## Notes
- 2026-10-08 13:32:19: test run — `npm run build && npm test && npm run test:e2e` exited 0 after 1m46s, on content fingerprint b9b7beacaecae4498b0a6b83a07bcbbd6fb49431 (the same before and after the run; .kerjaan/ left out).
- Site picker: opens a list of the yard's blocks, each with its fill and TEU; the current one is marked "Current". The yard has one block today, so the list has one row; picking it goes to the Yard view.
- Bell: lists finished, stopped and refused jobs, newest first, each with the yard-clock time it happened and, for stopped or refused jobs, the reason. The red dot shows only while there are events not yet seen; opening the list clears it. Events start again on Reset.
- Both close on Escape or a click elsewhere. The header now sits above the camera buttons, which used to cover the open lists.
- Found and fixed on the way: the colours for "success" and "warning" were never defined, so the Live dot, the trucks table's progress bars and the amber bars showed no colour; they do now. Also fixed two React warnings that came from updating shared state while drawing.
- Tests: `src/ui/dashboard/events.test.ts` (which job changes become events, once each, with reasons); `e2e/header.spec.ts` (picker opens with the current block marked and closes on Escape or a click elsewhere; the bell's dot, newest-first order, times, clearing on open, closing, and no page errors).
