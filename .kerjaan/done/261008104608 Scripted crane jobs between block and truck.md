---
type: feature
priority: medium
review:
labels: [crane, jobs, simulation]
reporter: mirza
assign_to: claude
created: 2026-10-08 10:46:26
updated: 2026-10-08 12:14:55
related: [261008104607]
blocked_by: [261008104603, 261008104604, 261008104605, 261008104606]
---

## Background
In daily operation the crane works through a list of jobs: unload a
container from an arriving truck into the block ("receiving"), or take one
from the block and load it on a waiting truck ("delivery"). Each job is a
fixed sequence: drive to the right bay, move the trolley over the right row,
lower, lock, raise, move over the truck lane, lower, release, raise. Watching
this run on its own is what makes the twin feel alive, as the reference does.

## Request
Jobs can be started from the screen that make a truck drive in, the crane
carry a container between that truck and a chosen block address, and the truck
drive away — covering one 20ft, two 20ft, and one 40ft loads in both
directions.

## Done when
- [x] A "delivery" job takes a container from a chosen block address, loads it on a truck that drove in, and the truck drives away with it
- [x] A "receiving" job takes a container off an arriving truck and stores it at a chosen free block address
- [x] A two-20ft delivery places both containers on one truck in the correct trailer positions, one after the other
- [x] Jobs that cannot be done (container buried under others, target slot occupied, wrong trailer load) are refused before they start, with the reason shown
- [x] Several jobs can be queued and run one after another without a person touching anything
- [x] At no point does a container pass through another container, the crane, or the truck

## History
- 2026-10-08 10:46:26 backlog
- 2026-10-08 12:00:41 todo
- 2026-10-08 12:07:19 in_progress
- 2026-10-08 12:14:03 review
- 2026-10-08 12:14:55 done

## Notes
- 2026-10-08 12:14:03: test run — `npm run build && npm test` exited 0 after 0m13s, on content fingerprint 3265c3e5db7b31351726c2c64dccd06e10f9e4e1 (the same before and after the run; .kerjaan/ left out).
- The "Yard" tab is now the whole terminal: Block A, its RTG, the truck lane, and a route from the Gate round two corners into the lane and out past the block. The "Crane jobs" panel picks Delivery (block → truck) or Receiving (truck → block), a load (1 × 20ft, 2 × 20ft, 1 × 40ft, 1 × 40ft HC) and the bay-row-tier address of each container; "Pick for me" fills in valid addresses, "Queue demo jobs" adds four mixed jobs, and the speed buttons run time at 1×, 4× or 10×. The panel can be folded away with Hide.
- A job: the truck drives in from the gate and parks beside the bays the job uses; the crane raises the spreader to just above the highest thing in the yard, sets the spreader length, moves over the container, lowers, locks, lifts, carries, lowers and releases (a 2 × 20ft job does this twice, front position first, then rear); the truck drives out with its load. Jobs run one after another; a single job takes about 2½–4 minutes of yard time.
- Checks before a job is queued, against the block as it will be after every job already in the queue: no container at the address, a container buried under others (naming them; allowed when the same job takes the ones on top first), a container that does not match the booked load, a target slot already taken or in mid-air, a wrong bay number for the size, and loads a trailer cannot carry.
- Never passing through anything: the crane lowers only onto what is below and will not drag a low load sideways (from the crane ticket); the crane is fully raised before any truck drives under it; trucks are only handed to the crane once parked. Automated tests run a mixed queue to the end and check at every step that nothing hanging goes below what is under it, that nothing hangs low while a truck moves, and that no two containers ever share space.
- Checked in the browser: four demo jobs (2 × 20ft delivery, 40ft HC receiving, 40ft delivery, 20ft receiving) ran to Done on their own at 10×; refusals shown for a buried container, an occupied target and a 40ft in a 20ft bay number.
- Development aid: `window.__porttrack` now holds one entry per view (`yard.runner`, `crane.controller`); see the README. The crane ticket's note naming `window.__porttrack.crane` as the controller is out of date — it is `window.__porttrack.crane.controller` now.
- 2026-10-08: Reviewed at level quick, round 1, at commit dc573e3 (work in 92ace42): the project's checks were carried from the worker's run and the change was read against the criteria. No servers were started and nothing was deliberately broken.
  - Where the work is: no branch carries this ticket's ID, so the work is in the main tree at HEAD.
  - Checks: `test-run.sh --check 261008104608 HEAD` answered SAME, meaning HEAD has exactly the content of the 2026-10-08 12:14:03 run (`npm run build && npm test` exited 0, fingerprint 3265c3e5db7b31351726c2c64dccd06e10f9e4e1). It was not run again. `explain.sh check`: no explanation written (owner_explanation is off). The repo has no CLAUDE.md or AGENTS.md.
  - Delivery: met. In `JobRunner`, the truck drives in, is handed to the crane once parked, the crane lifts from the block address and releases on the trailer slot, and the truck drives to Exit with whatever is on it. Tests "delivery: …" and "trucks leave carrying exactly what was loaded" cover this.
  - Receiving: met. The truck arrives loaded and each container is checked with `canPlace` and placed at the chosen address. Test "receiving: …" checks the final addresses and types.
  - Two-20ft delivery: met. `slotOrder` puts front20 before rear20, the moves run one after the other, and the test records the trailer load going `{}` → front20 → front20+rear20.
  - Refusals before start: met. `planJob` runs inside `add()`, before anything is queued, and checks against the block as it will be once the queue has run. It covers buried containers, an empty address, an occupied or mid-air target, a booked-load mismatch and a load the trailer cannot carry, all tested. The panel shows the reason as "Refused. <reason>". I judged that this message appears on screen by reading the panel code only.
  - Queue runs unattended: met. `tick` starts the next queued job when none is running, and the test "a mixed queue runs to the end on its own" finishes four jobs.
  - No passing through: met as far as the automated checks reach. The tests check at every step that nothing hanging goes below the floor under it (block and parked truck), that nothing hangs low while a truck is driving, and that no two containers in the world sit in the same space. The crane is sent to full hoist before every truck drives in.
  - Notes (not blocking):
    - The "same space" check in the tests only flags two containers whose footprints overlap *and* whose tops are at the same height. Two boxes overlapping at different heights would not be flagged. The hanging-clearance check covers the main way that could happen (a carried box), so this does not undermine the criterion.
    - When a job fails mid-run, `tick` marks it failed, but the truck and the planned block stay as they were. The next queued job then starts against a `planned` block that no longer matches the real one, while the failed job's parked truck is still in the world until the new truck parks. No current path fails, so this is an edge case.
    - The `truckSeq` and box-ID counters are module-level, so they keep counting after Reset. This is cosmetic.

### Suggested follow-up

- **A failed crane job leaves the yard in a half-finished state.** If a job stops partway (for example, the crane is blocked), it is marked failed, but its truck stays parked and the queue's plan of the block still assumes the job finished. The next queued job then starts against a wrong picture of the yard. Worth a ticket: after a failure, either pause the queue and say so, or re-plan the remaining jobs against the real block and send the stranded truck away.
