---
type: task
priority: high
review:
labels: [setup, scene, style]
reporter: mirza
assign_to: claude
created: 2026-10-08 10:46:25
updated: 2026-10-08 11:04:48
related: []
blocked_by: []
---

## Background
We are building a 3D "digital twin" of a container terminal yard: a live
picture of the yard that an operations person can look at, much like the
warehouse app in the style reference (docs/style-reference.png). Nothing exists
yet. Before any yard equipment can be drawn, the project needs a running web
page with an empty 3D world that already looks like the reference: a soft,
toy-like isometric view (seen from above at an angle, like a diorama), light
lavender-white ground, gentle shadows and the royal blue brand colour.

The agreed tools are a web app built with React and Three.js (a library for
drawing 3D in the browser) through its React layer, React Three Fiber. All 3D
objects will be built from simple shapes in code rather than drawn in a
separate 3D program, so sizes stay exact and the style stays consistent.

## Request
A web page that opens on an empty, styled 3D yard which the viewer can look
around, plus the project scaffolding every later piece of work will build on:
one place where colours and real-world sizes are defined, and an automated
check that the project still builds and its tests pass.

## Done when
- [x] Starting the project locally opens a page showing an empty ground area seen at an isometric angle
- [x] The ground, light and shadows look like the style reference when the two are placed side by side (light ground, soft shadows, no harsh black)
- [x] The viewer can zoom, rotate and pan the view with the mouse, and a "home" button returns to the starting view
- [x] Distances in the world are in real metres: a 10 m reference grid or ruler is visible and can be switched off
- [x] The project's check command (build and tests) runs and passes
- [x] A short README explains how to start the project and run the checks

## History
- 2026-10-08 10:46:25 backlog
- 2026-10-08 10:57:35 todo
- 2026-10-08 10:57:48 in_progress

## Notes
- 2026-10-08 11:04:48: test run — `npm run build && npm test` exited 0 after 0m11s, on content fingerprint c0ee6e65cbdfc4bf6abff070a67c8e044637d6ab (the same before and after the run; .kerjaan/ left out).
- Ground colour is drawn unlit (always exactly the palette's lavender-white) with a transparent shadow catcher on top, so shadows stay soft blue-grey rather than black. Checked with a temporary 40ft-sized box, removed again; the yard view ships empty.
- Start with `npm run dev`; the view can be switched later with `?view=<id>` (only "Yard" exists so far, so the view tabs stay hidden).
- Camera buttons: zoom ±, rotate 45° left/right, home, grid/ruler toggle. Mouse: left-drag rotate, right-drag pan, scroll zoom.
