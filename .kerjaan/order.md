Sixth batch: the quayside, the vessel and the quay crane, joined to the yard.

**Then on its own.** The ship needs the berth, and both the stowage and the
quay crane are sized from this ship.

- 261016170902 Parametric container vessel moored at the berth

**Then these two, side by side.** Neither needs the other's result (the
crane's clearance comes from the ship's tallest allowed deck stack, not from
stowed containers); 261016170903 and 261016170904 both change
src/views/YardView.tsx and src/styles.css, and 261016170903 lands first.

- 261016170903 Vessel deck stowage with ship bay row tier addresses
- 261016170904 Quay crane model with boom trolley hoist and spreader

**Then on its own.** It needs both the stowage and the crane, and builds the
ship pick-up and set-down the jobs will use.

- 261016170905 Manual quay crane controls

**Then on its own.** The jobs drive the crane through the steps the manual
controls built.

- 261016170906 Quay crane jobs between vessel and trucks on the apron

**Then on its own.** It joins the quay jobs to the yard jobs, and how it does
that decides what the dashboard counts.

- 261016170907 Containers travel between vessel and yard block by truck

**Last, these two side by side.** They are independent; 261016170908 and
261016170909 both change src/views/YardView.tsx, and 261016170908 lands first.

- 261016170908 Dashboard shows the vessel call and quay crane progress
- 261016170909 Vessel holds below deck with hatch covers
