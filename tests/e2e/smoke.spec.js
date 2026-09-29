const { test, expect } = require('@playwright/test');

function captureErrors(page) {
  const errors = [];
  page.on('pageerror', err => errors.push('pageerror: ' + err.message));
  page.on('console', msg => { if (msg.type() === 'error') errors.push('console: ' + msg.text()); });
  page.on('requestfailed', req => errors.push('requestfailed: ' + req.url() + ' - ' + (req.failure()?.errorText || 'unknown')));
  return errors;
}

test('index loads without browser errors', async ({ page }) => {
  const errors = captureErrors(page);
  await page.goto('/index.html', { waitUntil: 'networkidle' });
  await expect(page.locator('body')).toBeVisible();
  expect(errors, errors.join('\n')).toEqual([]);
});

test('game loads without browser errors', async ({ page }) => {
  const errors = captureErrors(page);
  await page.goto('/game.html', { waitUntil: 'networkidle' });
  await expect(page.locator('body')).toBeVisible();
  expect(errors, errors.join('\n')).toEqual([]);
});

test('visible controls have usable geometry', async ({ page }) => {
  await page.goto('/game.html', { waitUntil: 'networkidle' });
  const controls = page.locator('button:visible, input:visible, select:visible, textarea:visible, a:visible');
  const count = await controls.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const el = controls.nth(i);
    const box = await el.boundingBox();
    expect(box, 'Control has no usable bounding box').not.toBeNull();
    if (box) expect(box.width).toBeGreaterThan(0);
  }
});

test('main UI buttons are clickable', async ({ page }) => {
  await page.goto('/game.html', { waitUntil: 'networkidle' });
  const buttons = page.locator('button:visible:enabled');
  const count = Math.min(await buttons.count(), 40);
  for (let i = 0; i < count; i++) {
    const button = buttons.nth(i);
    const label = ((await button.innerText().catch(() => '')) || '').trim().slice(0, 80);
    await button.scrollIntoViewIfNeeded();
    try {
      await button.click({ timeout: 3000 });
    } catch (e) {
      throw new Error('Button failed to click' + (label ? ' (' + label + ')' : '') + ': ' + e.message);
    }
    await page.waitForTimeout(100);
  }
});

test('mobile layout has no horizontal overflow', async ({ page }) => {
  await page.goto('/game.html', { waitUntil: 'networkidle' });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
  expect(overflow).toBeFalsy();
});
