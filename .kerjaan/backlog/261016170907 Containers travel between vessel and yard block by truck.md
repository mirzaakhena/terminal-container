---
type: feature
priority: medium
review:
labels: [jobs, simulation, yard, quay]
reporter: mirza
assign_to: claude
created: 2026-10-16 17:09:53
updated: 2026-10-16 17:11:12
related: [261016170906, 261008104608]
blocked_by: [261016170906]
---

## Background
In a real terminal a container discharged from a ship does not stop on the
apron: a truck carries it to a storage block, where the yard crane stacks it
until it leaves by road. For export, a container waits in the block, then a
truck takes it to the quay and the quay crane loads it on the ship. With the
quay crane jobs and the yard jobs both in place, they can now be joined.

## Request
A container can be moved end to end: from a ship slot to a yard block
address (quay crane, truck, yard crane), and from a yard block address to a
ship slot, as one job the operator queues, with both cranes and the truck
working in turn.

## Done when
- [ ] An "import" job takes a container off the ship, a truck carries it from the apron to the block, and the yard crane stacks it at the chosen block address
- [ ] An "export" job takes a container from a block address, a truck carries it to the apron, and the quay crane stows it at the chosen ship address
- [ ] Both ends are checked before the job starts (ship address and block address), with the reason if either cannot be done
- [ ] While the truck drives between quay and yard, both cranes stay clear of its path
- [ ] A queue of mixed import and export jobs runs to the end on its own without anything passing through anything (checked automatically)
- [ ] The container's address is shown changing from ship to truck to block (or back) as it moves

## History
- 2026-10-16 17:09:53 backlog

## Notes
(none yet)
