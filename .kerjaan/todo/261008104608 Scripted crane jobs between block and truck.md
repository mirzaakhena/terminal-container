---
type: feature
priority: medium
review:
labels: [crane, jobs, simulation]
reporter: mirza
assign_to: claude
created: 2026-10-08 10:46:26
updated: 2026-10-08 12:00:41
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
- [ ] A "delivery" job takes a container from a chosen block address, loads it on a truck that drove in, and the truck drives away with it
- [ ] A "receiving" job takes a container off an arriving truck and stores it at a chosen free block address
- [ ] A two-20ft delivery places both containers on one truck in the correct trailer positions, one after the other
- [ ] Jobs that cannot be done (container buried under others, target slot occupied, wrong trailer load) are refused before they start, with the reason shown
- [ ] Several jobs can be queued and run one after another without a person touching anything
- [ ] At no point does a container pass through another container, the crane, or the truck

## History
- 2026-10-08 10:46:26 backlog
- 2026-10-08 12:00:41 todo

## Notes
(none yet)
