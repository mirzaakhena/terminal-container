---
type: feature
priority: low
review:
labels: [ui, dashboard]
reporter: mirza
assign_to: claude
created: 2026-10-08 12:49:49
updated: 2026-10-08 12:50:16
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
- [ ] Clicking the site picker opens a list of the yard's blocks, with the current one marked
- [ ] Clicking the bell opens a list of recent job events, newest first, each with its time
- [ ] The red dot on the bell only shows when there are events not yet seen, and opening the list clears it
- [ ] Both lists close when clicking elsewhere or pressing Escape

## History
- 2026-10-08 12:49:49 backlog

## Notes
(none yet)
