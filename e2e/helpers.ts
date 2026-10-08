import { expect, type Page } from '@playwright/test';

type Vec3 = [number, number, number];

/** Opens a view and waits until the 3D scene and its camera are running. Fails on any page error. */
export async function openView(page: Page, view: string) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/favicon/.test(m.text())) errors.push(m.text());
  });
  await page.goto(`/?view=${view}`);
  await page.waitForFunction(() => {
    const h = (window as unknown as { __porttrack?: { camera?: unknown; scene?: unknown } }).__porttrack;
    return !!h?.camera && !!h?.scene;
  });
  await settleCamera(page);
  return errors;
}

export async function camera(page: Page): Promise<{ position: Vec3; target: Vec3 }> {
  return page.evaluate(() => {
    const c = (window as unknown as { __porttrack: { camera: { position(): Vec3; target(): Vec3 } } }).__porttrack.camera;
    return { position: c.position(), target: c.target() };
  });
}

/** Waits for any camera glide to finish. */
export async function settleCamera(page: Page) {
  await page.waitForFunction(() => !(window as unknown as { __porttrack: { camera: { moving(): boolean } } }).__porttrack.camera.moving());
  await page.waitForTimeout(150);
}

export const distance = (c: { position: Vec3; target: Vec3 }) =>
  Math.hypot(c.position[0] - c.target[0], c.position[1] - c.target[1], c.position[2] - c.target[2]);

export const azimuth = (c: { position: Vec3; target: Vec3 }) => Math.atan2(c.position[2] - c.target[2], c.position[0] - c.target[0]);

export async function sceneHas(page: Page, name: string): Promise<boolean> {
  return page.evaluate((n) => {
    const s = (window as unknown as { __porttrack: { scene: { getObjectByName(n: string): unknown } } }).__porttrack.scene;
    return !!s.getObjectByName(n);
  }, name);
}

export async function clickCameraButton(page: Page, title: string) {
  await page.getByRole('toolbar', { name: 'Camera' }).getByTitle(title, { exact: true }).click();
  await settleCamera(page);
}

export function expectClose(actual: number, expected: number, tolerance: number, what: string) {
  expect(Math.abs(actual - expected), `${what}: expected about ${expected.toFixed(2)}, got ${actual.toFixed(2)}`).toBeLessThan(tolerance);
}
