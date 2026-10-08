---
type: bug
priority: medium
review:
labels: [crane, controls]
reporter: mirza
assign_to: claude
created: 2026-10-08 12:49:49
updated: 2026-10-08 13:05:59
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
- 2026-10-08 13:05:18 review
- 2026-10-08 13:05:59 done

## Notes
- 2026-10-08 13:05:06: test run — `npm run build && npm test && npm run test:e2e` exited 0 after 1m39s, on content fingerprint d470db67a2f1861e08ea6e6bc9d5ce2eb226d0ec (the same before and after the run; .kerjaan/ left out).
- The Crane view now keeps track of which movements are being held, by key or button. When the window loses focus, or the tab is hidden, every held movement is let go: the crane brakes and lines up on the nearest slot, as on a normal release. Each movement is stopped and lined up once (the manual-controls review noted it ran twice on a button release; harmless, now gone).
- Browser checks (`e2e/crane.spec.ts`): a held key and a held mouse button are each let go when the window loses focus, hiding the tab does the same, and a normal hold-and-release still lines up on a bay. The window losing focus is simulated with the same event the browser sends on Cmd+Tab. With the focus handling removed on purpose, the first three fail ("the crane kept moving instead of stopping") and the fourth still passes; restored afterwards.
- These four cases add about a minute to the full check (the crane brakes and lines up in real time on the software renderer).
- 2026-10-08: Reviewed at level quick, round 1, at commit 0310f46 (code in 7c38a08): the project's checks were not run again, because git confirmed the worker's passing run covered exactly this content; the change was read against each criterion. No earlier review; no separate branch for this ticket; the work is in the main tree.
  - Checks: `test-run.sh --check 261008124901 HEAD` and on the working tree both answered SAME — `npm run build && npm test && npm run test:e2e` exited 0 at 2026-10-08 13:05:06 on fingerprint d470db67a2f1861e08ea6e6bc9d5ce2eb226d0ec. Carried from the worker's run. `explain.sh check`: no explanation (setting is off). The repo has no CLAUDE.md or AGENTS.md.
  - Criterion 1 (key held, window loses focus): met. The Crane view now listens for the window losing focus and lets go of every held movement through the same stop-and-line-up used on a normal release. The browser test holds D, sends the same blur event a window switch sends, and checks the crane stops, is not at the end of travel, and sits on a bay.
  - Criterion 2 (button held with the mouse): met. Buttons now go through the same list of held movements, so the blur handler lets them go too; a browser test covers it. The later mouse release does nothing extra, because each movement is stopped once.
  - Criterion 3 (normal hold and release): met. Key and button releases still call the same stop-and-line-up; a browser test holds D for 2 s, releases, and checks it lines up on a bay.
  - Criterion 4 (automated test): met — `e2e/crane.spec.ts`, four browser tests, passing in the carried run.
  - Judged by reading only: that the tests go red without the fix (the worker's notes say they do; a quick review does not break the code to check), and the real Cmd+Tab in a real browser (the tests simulate it with the same event).
  - Note: the tests check "not at the end of travel" (less than 1 m from the end) rather than "near where focus was lost". The code brakes at once, so the behaviour is right, but the test would also pass on a crane that coasted most of the way before stopping.
  - Note: holding two controls for the same direction of travel at once (for example A and D, or D plus the Forward button) still stops that movement when either one is released. This is how it worked before too; not a regression.
