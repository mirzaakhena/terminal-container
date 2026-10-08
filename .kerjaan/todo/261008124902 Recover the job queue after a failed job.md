---
type: bug
priority: medium
review:
labels: [jobs, simulation]
reporter: mirza
assign_to: claude
created: 2026-10-08 12:49:49
updated: 2026-10-08 12:50:16
related: [261008104608]
blocked_by: []
---

## Background
In the Yard view, crane jobs run one after another from a queue. Each job is
checked when it is added, against the block as it will be once the jobs ahead
of it have run. If a job nevertheless stops partway (for example because
something was put in the way by hand), its truck stays parked in the lane, and
the queue still assumes the job finished. The next job then starts from a
wrong picture of the yard and can fail too. Nothing in the app causes a
failure today, so this has not been seen in normal use. The reviewer of the
crane jobs ticket found it.

## How to reproduce
1. Start the app with `npm run dev` and open the Yard view
2. Queue a receiving job for one 20ft container into an empty slot, and note its address
3. While the truck is still driving in, put another container in that slot from the browser console (the README's development aids explain how to reach the yard)
4. Let the job run

The job stops with an error, its truck stays parked under the crane, and the jobs after it carry on as if the slot had been filled.

## Request
When a job cannot finish, the yard stays consistent: the queue pauses and
says why, the stranded truck is sent away (or kept clearly marked), and the
remaining jobs are checked again against the block as it really is before
anything else runs.

## Done when
- [ ] The steps above end with the queue paused and a message saying which job stopped and why
- [ ] The truck of the stopped job no longer blocks the lane, or is clearly shown as stranded with a way to send it off
- [ ] Jobs still queued are checked again; any that can no longer work are marked as refused with a reason, and the rest can be resumed
- [ ] A container being carried when the job stopped is not lost: it is either put back or still shown on the crane
- [ ] An automated test covers a job that fails partway

## History
- 2026-10-08 12:49:49 backlog
- 2026-10-08 12:50:16 todo

## Notes
(none yet)
