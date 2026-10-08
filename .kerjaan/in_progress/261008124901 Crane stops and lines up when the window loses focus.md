---
type: bug
priority: medium
review:
labels: [crane, controls]
reporter: mirza
assign_to: claude
created: 2026-10-08 12:49:49
updated: 2026-10-08 13:05:06
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
- [x] The steps above end with the crane stopped near where the window lost focus, lined up on a slot, not at the end of its travel
- [x] The same holds when a movement button is being held with the mouse and the window loses focus
- [x] Holding and letting go normally still works as before
- [x] An automated test covers losing focus during a movement

## History
- 2026-10-08 12:49:49 backlog
- 2026-10-08 12:50:16 todo
- 2026-10-08 12:55:54 in_progress

## Notes
- 2026-10-08 13:05:06: test run — `npm run build && npm test && npm run test:e2e` exited 0 after 1m39s, on content fingerprint d470db67a2f1861e08ea6e6bc9d5ce2eb226d0ec (the same before and after the run; .kerjaan/ left out).
- The Crane view now keeps track of which movements are being held, by key or button. When the window loses focus, or the tab is hidden, every held movement is let go: the crane brakes and lines up on the nearest slot, as on a normal release. Each movement is stopped and lined up once (the manual-controls review noted it ran twice on a button release; harmless, now gone).
- Browser checks (`e2e/crane.spec.ts`): a held key and a held mouse button are each let go when the window loses focus, hiding the tab does the same, and a normal hold-and-release still lines up on a bay. The window losing focus is simulated with the same event the browser sends on Cmd+Tab. With the focus handling removed on purpose, the first three fail ("the crane kept moving instead of stopping") and the fourth still passes; restored afterwards.
- These four cases add about a minute to the full check (the crane brakes and lines up in real time on the software renderer).
