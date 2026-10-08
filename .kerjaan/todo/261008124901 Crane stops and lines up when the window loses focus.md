---
type: bug
priority: medium
review:
labels: [crane, controls]
reporter: mirza
assign_to: claude
created: 2026-10-08 12:49:49
updated: 2026-10-08 12:50:16
related: [261008104607]
blocked_by: []
---

## Background
In the Crane view a person moves the crane by holding a button or a key, and
when they let go the crane stops and lines itself up on the nearest slot. If
the browser window loses focus while a key is held — the person switches to
another window or app — the program never hears the key being let go. The
crane then keeps driving until it reaches the end of its travel, and does not
line up. The reviewer of the manual controls ticket found this.

## How to reproduce
1. Open the Crane view
2. Hold the D key so the gantry starts moving
3. While still holding D, switch to another window (for example with Cmd+Tab), then let go of D
4. Switch back to the app

The crane has kept driving to the far end of the block instead of stopping where the key was let go.

## Request
When the app stops receiving keyboard or mouse input in the middle of a
movement, every movement in progress stops and lines up, exactly as if the
person had let go.

## Done when
- [ ] The steps above end with the crane stopped near where the window lost focus, lined up on a slot, not at the end of its travel
- [ ] The same holds when a movement button is being held with the mouse and the window loses focus
- [ ] Holding and letting go normally still works as before
- [ ] An automated test covers losing focus during a movement

## History
- 2026-10-08 12:49:49 backlog
- 2026-10-08 12:50:16 todo

## Notes
(none yet)
