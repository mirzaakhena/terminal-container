---
type: feature
priority: low
review:
labels: [ui, dashboard]
reporter: mirza
assign_to: claude
created: 2026-10-08 12:49:49
updated: 2026-10-08 13:33:03
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
- 2026-10-08 13:33:03 done

## Notes
- 2026-10-08 13:32:19: test run — `npm run build && npm test && npm run test:e2e` exited 0 after 1m46s, on content fingerprint b9b7beacaecae4498b0a6b83a07bcbbd6fb49431 (the same before and after the run; .kerjaan/ left out).
- Site picker: opens a list of the yard's blocks, each with its fill and TEU; the current one is marked "Current". The yard has one block today, so the list has one row; picking it goes to the Yard view.
- Bell: lists finished, stopped and refused jobs, newest first, each with the yard-clock time it happened and, for stopped or refused jobs, the reason. The red dot shows only while there are events not yet seen; opening the list clears it. Events start again on Reset.
- Both close on Escape or a click elsewhere. The header now sits above the camera buttons, which used to cover the open lists.
- Found and fixed on the way: the colours for "success" and "warning" were never defined, so the Live dot, the trucks table's progress bars and the amber bars showed no colour; they do now. Also fixed two React warnings that came from updating shared state while drawing.
- Tests: `src/ui/dashboard/events.test.ts` (which job changes become events, once each, with reasons); `e2e/header.spec.ts` (picker opens with the current block marked and closes on Escape or a click elsewhere; the bell's dot, newest-first order, times, clearing on open, closing, and no page errors).

### Review — 2026-10-08
Reviewed at level quick, round 1, at commit 81f8812 (work in commit 090ab01): the project's checks were carried from the worker's run and the change was read against the criteria. No servers were started and nothing was deliberately broken.

- Checks: `test-run.sh --check 261008124903` and `--check 261008124903 HEAD` both answered SAME: the run of 2026-10-08 13:32:19 (`npm run build && npm test && npm run test:e2e`, exit 0, fingerprint b9b7beacaecae4498b0a6b83a07bcbbd6fb49431) covered exactly this content, so it was not run again.
- `explain.sh check`: no explanation written; `owner_explanation` is `off`.
- The work is on the main branch in this tree; there is no separate ticket branch.
- The repo has no CLAUDE.md or AGENTS.md, so no project rules apply.

Criteria:
- [x] Site picker opens a list of blocks with the current one marked: `SitePicker` in `src/ui/Header.tsx` renders a listbox with one option per block, the current one `aria-selected` and labelled "Current". The e2e test `site picker lists the blocks...` opens it and checks the selected option is Block A. The list is a single hard-coded entry, because the yard has only one block today.
- [x] Bell opens a list of recent job events, newest first, each with its time: `events.ts` turns done/failed/refused jobs into events, sorted newest first, and the time comes from `finishedAt` (or the yard clock). The e2e test checks that two pushed jobs show in newest-first order and that the time is shown (08:15). The unit tests check that each job is reported once, with its reason.
- [x] Red dot only shows for unseen events, and opening clears it: the dot renders only when `unread > 0`, and opening calls `markEventsRead`. The e2e test checks no dot at start, a dot after new events, and no dot after opening.
- [x] Both lists close on a click elsewhere or Escape: `usePopover` listens for an outside mousedown and for Escape. The e2e tests cover both ways of closing for both lists.

Notes (not blocking):
- Events are recorded only while the Dashboard is mounted, and it is mounted only in the Yard view (`src/App.tsx:30`), but the bell is in the header of every view. A job that ends while another view is shown appears only after returning to the Yard view. Its time is still correct (`finishedAt`), but if it is recorded together with later events, the newest-first order across batches could be off.
- If an event arrives while the bell list is open, it counts as unread. The dot then shows again after closing, even though the person may have seen the event.
- `e2e/header.spec.ts` has a duplicated comment line ("Two jobs reach an end state...").
- The CSS fix for the undefined `--success`/`--warning` colours goes beyond this ticket. It was judged by reading only.

### Suggested follow-up

- **Notifications are only collected while the Yard view is open.** The bell is in every view's header, but job events are only noticed while the Yard view's dashboard is on screen. Someone watching another view gets no red dot when jobs finish there. Worth a ticket: collect events no matter which view is shown, so the bell is up to date everywhere.
