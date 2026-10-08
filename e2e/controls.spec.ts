import { expect, test } from '@playwright/test';
import { azimuth, camera, clickCameraButton, distance, expectClose, openView, sceneHas } from './helpers';

test.describe('camera buttons', () => {
  test('"Zoom in" button moves the camera closer', async ({ page }) => {
    await openView(page, 'yard');
    const before = distance(await camera(page));
    await clickCameraButton(page, 'Zoom in');
    const after = distance(await camera(page));
    expect(after, '"Zoom in" did not bring the camera closer').toBeLessThan(before * 0.9);
  });

  test('"Zoom out" button moves the camera further away', async ({ page }) => {
    await openView(page, 'yard');
    const before = distance(await camera(page));
    await clickCameraButton(page, 'Zoom out');
    const after = distance(await camera(page));
    expect(after, '"Zoom out" did not move the camera away').toBeGreaterThan(before * 1.1);
  });

  test('"Rotate left" and "Rotate right" buttons turn the view by 45° each way', async ({ page }) => {
    await openView(page, 'containers');
    const start = azimuth(await camera(page));
    await clickCameraButton(page, 'Rotate left');
    const left = azimuth(await camera(page));
    await clickCameraButton(page, 'Rotate right');
    await clickCameraButton(page, 'Rotate right');
    const right = azimuth(await camera(page));
    const turn = (a: number, b: number) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
    expectClose(Math.abs(turn(left, start)), Math.PI / 4, 0.05, '"Rotate left" turn (radians)');
    expectClose(Math.abs(turn(right, start)), Math.PI / 4, 0.05, '"Rotate right" turn (radians)');
    expect(Math.sign(turn(left, start)), '"Rotate left" and "Rotate right" turned the same way').not.toBe(Math.sign(turn(right, start)));
  });

  test('"Home view" button returns to the starting view', async ({ page }) => {
    await openView(page, 'truck');
    const home = await camera(page);
    await clickCameraButton(page, 'Zoom in');
    await clickCameraButton(page, 'Rotate right');
    const moved = await camera(page);
    expect(distance(moved), 'setup: the view should have changed before pressing Home').not.toBeCloseTo(distance(home), 0);
    await clickCameraButton(page, 'Home view');
    const back = await camera(page);
    for (let i = 0; i < 3; i++) expectClose(back.position[i], home.position[i], 0.1, `"Home view" camera position[${i}]`);
  });
});

test('grid button hides and shows the 10 m grid and ruler', async ({ page }) => {
  await openView(page, 'yard');
  const grid = page.getByRole('toolbar', { name: 'Camera' }).getByRole('button', { name: /10 m grid/ });
  await expect(grid, 'grid button should start pressed').toHaveAttribute('aria-pressed', 'true');
  expect(await sceneHas(page, 'reference-grid'), 'grid should be shown at first').toBe(true);
  expect(await sceneHas(page, 'scale-ruler'), 'ruler should be shown at first').toBe(true);
  await grid.click();
  await expect(grid, 'grid button did not switch off when clicked').toHaveAttribute('aria-pressed', 'false');
  expect(await sceneHas(page, 'reference-grid'), 'grid button did not hide the grid').toBe(false);
  expect(await sceneHas(page, 'scale-ruler'), 'grid button did not hide the ruler').toBe(false);
  await grid.click();
  expect(await sceneHas(page, 'reference-grid'), 'grid button did not bring the grid back').toBe(true);
});

const VIEWS: { tab: string; id: string; expectText: RegExp }[] = [
  { tab: 'Yard', id: 'yard', expectText: /Job Tracking/ },
  { tab: 'Containers', id: 'containers', expectText: /40ft High Cube/ },
  { tab: 'Truck', id: 'truck', expectText: /Trailer load/ },
  { tab: 'Block', id: 'block', expectText: /Place a container/i },
  { tab: 'Drive', id: 'drive', expectText: /Trailer angle/ },
  { tab: 'Crane', id: 'crane', expectText: /RTG-01/ },
];

test('every view opens from the header without errors', async ({ page }) => {
  const errors = await openView(page, 'yard');
  for (const v of VIEWS) {
    await page.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: v.tab, exact: true }).click();
    await expect(page, `"${v.tab}" tab did not switch the view`).toHaveURL(new RegExp(`view=${v.id}`));
    await expect(page.locator('body'), `"${v.tab}" view is missing its content`).toContainText(v.expectText);
    await expect(page.locator('canvas'), `"${v.tab}" view has no 3D scene`).toBeVisible();
  }
  expect(errors, 'the page reported errors while switching views').toEqual([]);
});
