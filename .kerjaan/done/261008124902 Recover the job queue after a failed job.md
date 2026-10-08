---
type: bug
priority: medium
review:
labels: [jobs, simulation]
reporter: mirza
assign_to: claude
created: 2026-10-08 12:49:49
updated: 2026-10-08 13:12:06
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
- [x] The steps above end with the queue paused and a message saying which job stopped and why
- [x] The truck of the stopped job no longer blocks the lane, or is clearly shown as stranded with a way to send it off
- [x] Jobs still queued are checked again; any that can no longer work are marked as refused with a reason, and the rest can be resumed
- [x] A container being carried when the job stopped is not lost: it is either put back or still shown on the crane
- [x] An automated test covers a job that fails partway

## History
- 2026-10-08 12:49:49 backlog
- 2026-10-08 12:50:16 todo
- 2026-10-08 13:05:53 in_progress
- 2026-10-08 13:11:10 review
- 2026-10-08 13:12:06 done

## Notes
- 2026-10-08 13:10:25: test run — `npm run build && npm test && npm run test:e2e` exited 0 after 1m44s, on content fingerprint 735bbb8ae15b909575cdfbf78bcb6d7bbed32e22 (the same before and after the run; .kerjaan/ left out).
- Before each pick and each set-down, the crane now checks that the yard still matches the plan (the container is still at its address with nothing on top; the target slot is still free and supported). Without this, a slot filled meanwhile would have been worked round silently, setting the container down one tier higher than planned.
- When a job cannot finish: the queue pauses; a container the crane is holding is put back where it came from (on the truck for a receiving, in its block slot for a delivery), or, if that is impossible too, kept on the crane and named in the message; the truck drives out; then every queued job is checked again against the block as it really is — those that can no longer work are marked Refused with the reason, the rest wait. The Crane jobs panel shows "Queue paused. JOB-… stopped: <reason>" with what the re-check found and a "Resume queue" button (unavailable while recovery is still running); the job list, timeline and trucks table show Stopped / Refused.
- Automated tests (`src/sim/recovery.test.ts`): a receiving into a slot filled meanwhile (box back on the truck, truck gone, a dependent job refused, an independent one still queued, nothing runs until Resume, then it completes); a delivery whose container disappeared (stops before lifting); a delivery interrupted while carrying (container returned to its slot); Resume refused while recovery is still running.
- Checked in the browser with the steps above: the banner showed "JOB-001 stopped: Cannot put MSKU700001 down: 17-01-1 is already taken by INTRUDER1. Re-checked the queue: the remaining jobs can still be done."; Resume carried on with JOB-002.

### Review 2026-10-08

Reviewed at level quick, round 1, at commit 6495c84 (ticket commit d19b07b): the project's checks were carried from the worker's run and the change was read against the criteria. The work is on `main` in the working tree; there is no separate ticket branch.

- Checks: `test-run.sh --check 261008124902` answered SAME — the run of 2026-10-08 13:10:25 (`npm run build && npm test && npm run test:e2e`, exit 0, fingerprint 735bbb8ae15b909575cdfbf78bcb6d7bbed32e22) covered exactly this content, so it was not repeated.
- No `CLAUDE.md` / `AGENTS.md` in the repo, so no written project rules apply. The owner explanation is set to `off`.
- Criterion 1 (queue paused, message naming the job and reason): met. `JobRunner.fail` sets `paused` with the job ID and reason; `step` does nothing while it is set; the Crane jobs panel shows "Queue paused. JOB-… stopped: …" from the store. The test `receiving into a slot that was filled meanwhile` checks the pause, the job ID and that the reason names the slot. The banner itself was judged by reading `YardView.tsx` only.
- Criterion 2 (truck no longer blocks the lane): met. `recover` drives the parked (or still arriving) truck to the exit and clears it from the world; the tests check `truck` is null and the world has no trucks.
- Criterion 3 (queued jobs re-checked, refused with a reason, the rest resumable): met. `replan` checks every queued job against the real block; the test shows the dependent job refused ("no longer at 05-01-1"), the independent one still queued, nothing running while paused, and finishing after `resume()`.
- Criterion 4 (a carried container is not lost): met. `putBackOps` returns it to the truck (receiving) or to its slot (delivery), and if that fails the crane keeps it and the message names it; `resume` is refused while the crane still holds something. Tests cover both put-back directions.
- Criterion 5 (automated test of a job that fails partway): met. `src/sim/recovery.test.ts`, four tests, part of the passing run above.

Notes (not blocking):
- If putting the container back also fails, `recover` adds "The crane is still holding …" to the message twice (once in the `catch`, once just after it). The wording is repeated; the information is right.
- No browser (e2e) test covers the pause banner or the Resume button; those were checked here by reading the code, and the worker reports a manual browser check.

Not verified by running anything: the banner text and Resume button in the browser (criterion 1, and the "resumed" part of criterion 3, which the unit test covers in the runner only).
