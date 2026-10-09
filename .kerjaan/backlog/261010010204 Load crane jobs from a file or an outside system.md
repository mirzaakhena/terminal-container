---
type: feature
priority: low
review:
labels: [jobs, data]
reporter: mirza
assign_to: claude
created: 2026-10-10 01:02:39
updated: 2026-10-10 01:03:08
related: [261008104608]
blocked_by: []
---

## Background
Today every crane job is typed into the panel by hand, or made up by "Queue
demo jobs". A real digital twin follows what the terminal is actually
doing: jobs come from the terminal's own planning system, or at least from a
list prepared beforehand. Which outside system or file format to use has not
been decided yet; the owner needs to choose before this can be started.

## Request
Crane jobs can be loaded from outside the app — a file the user picks, and
later a live feed — checked the same way as hand-typed jobs, with a clear
report of which entries were accepted and which were refused and why.

## Done when
- [ ] The owner has chosen the first source (for example a CSV or JSON file, or a named system) and its format; the choice and a sample are written in this ticket
- [ ] A user can pick a file in the Yard view and its jobs are added to the queue
- [ ] Each entry is checked like a hand-typed job; refused entries are listed with their line and reason, and do not stop the others
- [ ] A sample file with a mix of good and bad entries is included and documented in the README
- [ ] Loading the same file twice does not queue the same jobs twice

## History
- 2026-10-10 01:02:39 backlog

## Notes
(none yet)
