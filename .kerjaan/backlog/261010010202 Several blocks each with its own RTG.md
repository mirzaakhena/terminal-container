---
type: feature
priority: medium
review:
labels: [yard, crane, dashboard]
reporter: mirza
assign_to: claude
created: 2026-10-10 01:02:38
updated: 2026-10-10 01:03:08
related: [261008124903, 261008104605]
blocked_by: []
---

## Background
The yard has one storage block (Block A) with one RTG crane. Real container
yards have several blocks side by side, each usually with its own RTG, and
operators switch between them. The site picker in the dashboard header
already lists blocks, but there is only one to choose.

## Request
The yard holds several blocks, each with its own size and its own RTG,
arranged side by side with lanes between them. Jobs name the block they are
for, and the dashboard can be switched from one block to another.

## Done when
- [ ] The Yard view shows at least two blocks, each with its own RTG and truck lane, without anything overlapping
- [ ] Each block can have its own number of bays, rows and tiers, set in one place
- [ ] A job is queued for a chosen block and is worked by that block's crane; two blocks' cranes can work at the same time
- [ ] The site picker lists every block with its fill, and choosing one switches the dashboard's figures, detail panel and job list to it
- [ ] Clicking a block or crane in the scene selects that block
- [ ] Container addresses include the block (for example A-05-02-1), and search finds containers in any block

## History
- 2026-10-10 01:02:38 backlog

## Notes
(none yet)
