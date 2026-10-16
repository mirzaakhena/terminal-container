import { expect, test, type Page } from '@playwright/test';
import { openView, sceneHas } from './helpers';

type Vec3 = [number, number, number];
interface Layout {
  origin: Vec3;
  block: { length: number; width: number };
  /** The block lane's centreline. */
  laneZ: number;
  quay: {
    x0: number; x1: number; landZ: number; edgeZ: number;
    lanes: { number: number; z: number }[];
    ship: { x0: number; x1: number };
  };
}

const layout = (page: Page) =>
  page.evaluate(() => (window as unknown as { __porttrack: { yard: { layout: Layout } } }).__porttrack.yard.layout);

/** Screen position of yard-frame points, in normalised device coordinates. */
const project = (page: Page, points: Vec3[]) =>
  page.evaluate((pts) => {
    const h = (window as unknown as { __porttrack: { camera: { project(p: Vec3): Vec3 }; yard: { layout: Layout } } }).__porttrack;
    const o = h.yard.layout.origin;
    return pts.map((p) => h.camera.project([p[0] + o[0], p[1] + o[1], p[2] + o[2]]));
  }, points);

test('the Yard view shows the quayside: water, quay edge, berth with bollards, apron lanes and backreach', async ({ page }) => {
  const errors = await openView(page, 'yard');
  for (const name of ['water', 'quayside', 'berth', 'apron-lanes', 'backreach', 'roads']) {
    expect(await sceneHas(page, name), `"${name}" is missing from the scene`).toBe(true);
  }
  await expect(page.getByText('Berth 1 · 200 m'), 'berth name and length not shown').toBeVisible();
  await expect(page.getByText('for a 150 m ship')).toBeVisible();
  await expect(page.getByText('Apron', { exact: true })).toBeVisible();
  expect(errors, 'the page reported errors').toEqual([]);
});

test('the home view frames the block clearly with the quayside behind it', async ({ page }) => {
  await openView(page, 'yard');
  const l = await layout(page);
  const { length: L, width: W } = l.block;
  const q = l.quay;
  const block = await project(page, [[0, 0, 0], [L, 0, 0], [0, 0, W], [L, 0, W], [0, 14, 0], [L, 14, W]]);
  for (const [x, y] of block) {
    expect(Math.abs(x), 'part of the block is off screen').toBeLessThan(0.95);
    expect(Math.abs(y), 'part of the block is off screen').toBeLessThan(0.95);
  }
  // Clearly: in the middle of the screen, between the jobs panel and the detail panel, and not tiny.
  const xs = block.map((p) => p[0]);
  const ys = block.map((p) => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  expect(Math.abs(cx), 'the block is pushed to one side').toBeLessThan(0.3);
  expect(Math.max(...xs) - Math.min(...xs), 'the block is too small to read').toBeGreaterThan(0.35);
  expect(Math.max(...ys) - Math.min(...ys), 'the block is too small to read').toBeGreaterThan(0.35);
  // The quayside is in frame: its apron and the quay edge along the berth's middle.
  const mid = (q.ship.x0 + q.ship.x1) / 2;
  const quay = await project(page, [[mid, 0, q.lanes[0].z], [mid, 0, q.edgeZ], [mid - 40, 0, q.edgeZ], [mid + 40, 0, q.lanes[0].z]]);
  for (const [x, y] of quay) {
    expect(Math.abs(x), 'the quayside is out of frame').toBeLessThan(1);
    expect(Math.abs(y), 'the quayside is out of frame').toBeLessThan(1);
  }
});

test('demo drive: a truck goes from the gate along the apron, through the block lane and out', async ({ page }) => {
  const errors = await openView(page, 'yard');
  const l = await layout(page);
  const panel = page.locator('.yard-panel');
  await panel.getByRole('button', { name: 'Show' }).click();
  const drive = panel.getByRole('button', { name: 'Demo drive via quay' });
  await drive.click();
  const status = panel.getByRole('status');
  await expect(status).toContainText('on a demo drive');
  await expect(page.getByText(/TRK-\d+ on a demo drive/), 'trucks-on-site card does not show the drive').toBeVisible({ timeout: 30_000 });

  // A second drive while the first truck is on site is refused, with the reason.
  await drive.click();
  await expect(status).toContainText('Refused');
  await expect(status).toContainText('still on site');

  // Fast-forward the drive and note where the truck goes.
  const trip = await page.evaluate(({ lane1, laneZ }) => {
    const r = (window as unknown as { __porttrack: { yard: { runner: { truck: null | { motion: { pose(): { x: number; z: number } } }; step(dt: number): void } } } }).__porttrack.yard.runner;
    const seen: string[] = [];
    for (let i = 0; i < 20000 && r.truck; i++) {
      const p = r.truck.motion.pose();
      const where = Math.abs(p.z - lane1) < 1e-6 ? 'apron' : Math.abs(p.z - laneZ) < 1e-6 ? 'block lane' : null;
      if (where && seen[seen.length - 1] !== where) seen.push(where);
      r.step(0.1);
    }
    return { seen, gone: !r.truck };
  }, { lane1: l.quay.lanes[0].z, laneZ: l.laneZ });
  expect(trip.seen, 'the truck did not drive the apron and then the block lane').toEqual(['apron', 'block lane']);
  expect(trip.gone, 'the truck never left').toBe(true);
  await expect(page.getByText('none waiting'), 'the truck is still counted on site').toBeVisible({ timeout: 30_000 });

  // After it has gone, another drive can start; the message can be dismissed.
  await drive.click();
  await expect(status).toContainText('on a demo drive');
  await status.getByRole('button', { name: 'Dismiss' }).click();
  await expect(status).toBeHidden();
  expect(errors, 'the page reported errors during the drive').toEqual([]);
});
