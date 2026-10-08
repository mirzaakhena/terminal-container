import { expect, test } from '@playwright/test';
import { openView } from './helpers';

test('site picker lists the blocks with the current one marked, and closes on Escape or a click elsewhere', async ({ page }) => {
  await openView(page, 'yard');
  const picker = page.getByTitle('Terminal and block');
  await picker.click();
  const list = page.getByRole('listbox', { name: 'Blocks' });
  await expect(list, 'site picker did not open').toBeVisible();
  await expect(list.getByRole('option', { selected: true }), 'current block is not marked').toContainText('Block A');
  await page.keyboard.press('Escape');
  await expect(list, 'site picker did not close on Escape').toBeHidden();
  await picker.click();
  await expect(list).toBeVisible();
  await page.mouse.click(800, 500);
  await expect(list, 'site picker did not close on a click elsewhere').toBeHidden();
});

test('bell lists job events newest first; the red dot shows only for unseen ones', async ({ page }) => {
  const errors = await openView(page, 'yard');
  const bell = page.getByRole('button', { name: /^Notifications/ });
  await expect(page.getByTestId('unread-dot'), 'red dot shown with nothing new').toHaveCount(0);
  await bell.click();
  const panel = page.getByRole('dialog', { name: 'Notifications' });
  await expect(panel).toContainText('Nothing yet');
  await page.keyboard.press('Escape');
  await expect(panel, 'notifications did not close on Escape').toBeHidden();

  // Two jobs reach an end state, the second later than the first.
  // Two jobs reach an end state, the second later than the first (put straight into the runner's list).
  await page.evaluate(() => {
    const r = (window as unknown as { __porttrack: { yard: { runner: { jobs: unknown[] } } } }).__porttrack.yard.runner;
    const base = { kind: 'receiving', moves: [], step: '', stage: 4 };
    r.jobs.push({ ...base, id: 'JOB-T1', truckId: 'TRK-T1', status: 'done', finishedAt: 600 });
    r.jobs.push({ ...base, id: 'JOB-T2', truckId: 'TRK-T2', status: 'refused', finishedAt: 900, error: 'Test reason.' });
  });
  await expect(page.getByTestId('unread-dot'), 'red dot missing after new events').toHaveCount(1);
  await bell.click();
  const items = panel.getByRole('listitem');
  await expect(items).toHaveCount(2);
  await expect(items.nth(0), 'newest event is not first').toContainText('refused: Test reason.');
  await expect(items.nth(1)).toContainText('finished');
  await expect(items.nth(0)).toContainText('08:15');
  await expect(page.getByTestId('unread-dot'), 'opening the list did not clear the red dot').toHaveCount(0);
  await page.mouse.click(800, 500);
  await expect(panel, 'notifications did not close on a click elsewhere').toBeHidden();
  expect(errors, 'the page reported errors while showing notifications').toEqual([]);
});
