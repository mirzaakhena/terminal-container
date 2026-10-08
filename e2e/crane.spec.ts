import { expect, test, type Page } from '@playwright/test';
import { openView } from './helpers';

type Crane = {
  gantry: { pos: number; vel: number; max: number };
  moving: boolean;
  snapPositions(axis: 'gantry' | 'trolley'): number[];
};

const gantry = (page: Page) =>
  page.evaluate(() => {
    const c = (window as unknown as { __porttrack: { crane: { controller: Crane } } }).__porttrack.crane.controller;
    return { pos: c.gantry.pos, vel: c.gantry.vel, max: c.gantry.max, moving: c.moving, slots: c.snapPositions('gantry') };
  });

const waitForStop = (page: Page) =>
  page.waitForFunction(() => !(window as unknown as { __porttrack: { crane: { controller: Crane } } }).__porttrack.crane.controller.moving, null, { timeout: 30_000 });

/** Setup only: puts the trolley over row 1 so the gantry lines up with bays rather than trailer positions. */
async function trolleyOverBlock(page: Page) {
  await page.evaluate(() => {
    const c = (window as unknown as { __porttrack: { crane: { controller: { trolley: { pos: number; target: number; vel: number }; snapPositions(a: string): number[] } } } }).__porttrack.crane.controller;
    const row1 = c.snapPositions('trolley')[1];
    c.trolley.pos = row1;
    c.trolley.target = row1;
    c.trolley.vel = 0;
  });
}

async function expectStoppedOnASlot(page: Page, what: string) {
  try {
    await waitForStop(page);
  } catch {
    throw new Error(`${what}: the crane kept moving instead of stopping`);
  }
  const g = await gantry(page);
  expect(g.pos, `${what}: the crane drove on to the end of its travel`).toBeLessThan(g.max - 1);
  const nearest = Math.min(...g.slots.map((x) => Math.abs(x - g.pos)));
  expect(nearest, `${what}: the crane stopped but did not line up on a bay`).toBeLessThan(0.01);
}

test('a held key is let go when the window loses focus', async ({ page }) => {
  await openView(page, 'crane');
  await trolleyOverBlock(page);
  await page.keyboard.down('d');
  await page.waitForFunction(() => (window as unknown as { __porttrack: { crane: { controller: Crane } } }).__porttrack.crane.controller.gantry.vel > 1);
  // The person switches window: the page gets a blur and never sees the key-up.
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expectStoppedOnASlot(page, 'key held while the window lost focus');
});

test('a held movement button is let go when the window loses focus', async ({ page }) => {
  await openView(page, 'crane');
  await trolleyOverBlock(page);
  const forward = page.getByRole('button', { name: 'Forward ▶' });
  const box = (await forward.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForFunction(() => (window as unknown as { __porttrack: { crane: { controller: Crane } } }).__porttrack.crane.controller.gantry.vel > 1);
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expectStoppedOnASlot(page, 'button held while the window lost focus');
  await page.mouse.up();
});

test('hiding the tab also lets go', async ({ page }) => {
  await openView(page, 'crane');
  await trolleyOverBlock(page);
  await page.keyboard.down('d');
  await page.waitForFunction(() => (window as unknown as { __porttrack: { crane: { controller: Crane } } }).__porttrack.crane.controller.gantry.vel > 1);
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
  });
  await expectStoppedOnASlot(page, 'key held while the tab was hidden');
});

test('holding and letting go normally still lines up on a bay', async ({ page }) => {
  await openView(page, 'crane');
  await trolleyOverBlock(page);
  await page.keyboard.down('d');
  await page.waitForTimeout(2000);
  await page.keyboard.up('d');
  await expectStoppedOnASlot(page, 'normal key release');
});
