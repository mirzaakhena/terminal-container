Fourth batch: a browser check that guards the screens, then two reliability fixes it can cover.

**First, the browser check.** The fixes below each add a browser-level case to it, so it has to exist first.

- 261008120001 Automated browser test for the main screen controls

**Then these two, in any order.** They touch different parts of the app (crane controls, job queue).

- 261008124901 Crane stops and lines up when the window loses focus
- 261008124902 Recover the job queue after a failed job
