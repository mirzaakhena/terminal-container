---
type: feature
priority: high
review:
labels: [vessel, model]
reporter: mirza
assign_to: claude
created: 2026-10-16 17:09:48
updated: 2026-10-16 17:47:08
related: [261016170901]
blocked_by: [261016170901]
---

## Background
A container ship carries containers stacked in "bays" (slices across the
ship, each one 20ft container long), "rows" (side by side across the ship's
width) and "tiers" (layers upward). Ships come in very different sizes, from
small feeders of about 1,000 TEU (twenty-foot equivalent units, a measure of
capacity) to giants of over 20,000 TEU. The owner wants the ship's size to be
adjustable, with a small feeder as the default. Only the deck is modelled for
now; holds below deck come later (ticket 261016170909).

## Request
A container ship model, in the same soft low-poly style, whose length,
width and stacking height follow its number of bays, rows and tiers, lying
moored at the berth with its deck area ready to carry containers.

## Done when
- [ ] A ship lies at the berth in the Yard view, alongside the quay edge, in the scene's style (hull, accommodation block with bridge, funnel, deck)
- [ ] The default ship is a feeder of about 150 m long carrying 8 rows across, about 1,000 TEU, with a label showing both its nominal size and the deck slots modelled now (for example "about 1,000 TEU · 520 TEU on deck")
- [ ] The ship's size is one default setting; Bays / Rows / Tiers steppers in the ship's own view change that view's ship's length, width and space on deck, up to about 24,000 TEU (about 400 m, 24 rows on deck), while the Yard view keeps the default feeder
- [ ] The ship's deck has visible container positions (lashing bridges or deck markings between bays) for every bay and row
- [ ] The ship never overlaps the quay, and its side stays a realistic small gap from the quay edge
- [ ] A separate view or tab shows the ship on its own, with sizes labelled, like the container and truck showrooms

## History
- 2026-10-16 17:09:48 backlog
- 2026-10-16 17:47:08 todo

## Notes
- 2026-10-16 17:19:04: answered question: Where is the ship's size set? (a) Like the block: one default in the code, plus Bays / Rows / Tiers steppers in the ship's own view, which change only that view (the Yard view keeps the default feeder); (b) the steppers change the ship in the Yard view too; (c) only in the code. Recommended: (a). It matches how the block works, and the Yard view's jobs are never left with a ship that changed under them.
  answer, 2026-10-16 17:46:30: (a) One default in the code plus Bays / Rows / Tiers steppers in the ship's own view, which change only that view; the Yard view keeps the default feeder. (mirza: "setuju semua rekomendasi")
- 2026-10-16 17:19:05: answered question: How large may the setting make the ship? Recommended: from a small feeder up to the largest ships in service, about 400 m long and 24 rows across on deck (about 24,000 TEU), so the giants in the Background can be shown. The other option is a smaller cap, such as about 8,000 TEU, which keeps the quay and the quay crane smaller.
  answer, 2026-10-16 17:46:30: Up to about 24,000 TEU: about 400 m long, 24 rows on deck. (mirza: "setuju semua rekomendasi")
- 2026-10-16 17:19:05: answered question: Which TEU figure does the label show while only the deck is modelled? A real 1,000 TEU feeder carries about half of that on deck and half in the holds, which come later (261016170909). (a) Both: the nominal size and the deck slots modelled now, for example "about 1,000 TEU · 520 TEU on deck"; (b) the nominal size only; (c) the deck slots only, so the default ship is sized for about 1,000 TEU on deck alone, which makes it larger than a real 1,000 TEU feeder. Recommended: (a). The default stays a realistic 150 m feeder, and the figure stays honest.
  answer, 2026-10-16 17:46:31: (a) Show both, for example "about 1,000 TEU · 520 TEU on deck". (mirza: "setuju semua rekomendasi")
- 2026-10-16 17:19:36: files estimated to change: `src/config/theme.ts`, `src/models/quay/`, `src/models/vessel/`, `src/styles.css`, `src/views/VesselView.tsx`, `src/views/YardView.tsx`, `src/views/index.ts`
- Decision by mirza, 2026-10-16 (261016170901 question 4, for all nine tickets): the look-and-feel lines are checked by the reviewer in a browser with screenshots; no owner check, nothing deferred.
