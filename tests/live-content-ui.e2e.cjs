'use strict';
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const baseUrl = process.env.OUTLAST_RUNTIME_TEST_URL || 'https://outlast-test.onrender.com/index.html';

async function closeReleaseNotices(page) {
  await page.waitForTimeout(1200);
  for (const selector of ['#outlastUpdateLogClose', '#updatePopupClose']) {
    const button = page.locator(selector).first();
    if (await button.count() && await button.isVisible().catch(() => false)) {
      await button.click({ timeout: 5000 }).catch(() => {});
    }
  }
}

async function testViewport(name, viewport, isMobile) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport, isMobile, hasTouch: isMobile });
  const page = await context.newPage();
  const liveContentErrors = [];
  page.on('pageerror', error => {
    if (/live-content-schedule\.js/i.test(String(error && error.stack || error))) {
      liveContentErrors.push(String(error && error.message || error));
    }
  });

  try {
    const response = await page.goto(baseUrl + '?live-content-e2e=' + Date.now(), {
      waitUntil: 'domcontentloaded',
      timeout: 90000
    });
    assert.ok(response && response.ok(), name + ': tester game page should load');
    await page.waitForSelector('#outlastLiveContentButton', { state: 'visible', timeout: 60000 });
    await closeReleaseNotices(page);
    await page.locator('#outlastLiveContentButton').click();
    await page.waitForFunction(() => {
      const overlay = document.querySelector('#outlastLiveContentOverlay');
      return overlay && overlay.style.display === 'flex';
    }, { timeout: 15000 });
    await page.waitForFunction(() => {
      return window.OUTLAST_LIVE_CONTENT &&
        window.OUTLAST_LIVE_CONTENT.ok === true &&
        document.querySelectorAll('#outlastLiveContentOverlay .olc-card').length === 3;
    }, { timeout: 60000 });

    const panelText = await page.locator('#outlastLiveContentOverlay').innerText();
    assert.match(panelText, /Every 3 Days:/, name + ': small content rotation should be visible');
    assert.match(panelText, /Weekend Event:/, name + ': weekend event should be visible');
    assert.match(panelText, /Monthly Major Event:/, name + ': monthly finale should be visible');
    assert.match(panelText, /Project Blackout/, name + ': November event theme should be visible');
    assert.equal(liveContentErrors.length, 0, name + ': live content script should not throw browser errors');

    const shell = await page.locator('#outlastLiveContentOverlay .olc-shell').boundingBox();
    assert.ok(shell && shell.height <= viewport.height * 0.9 + 4, name + ': live content panel should fit the viewport');

    await page.keyboard.press('Escape');
    await page.waitForFunction(() => {
      const overlay = document.querySelector('#outlastLiveContentOverlay');
      return overlay && overlay.style.display === 'none';
    }, { timeout: 5000 });
    console.log(name + ' Live Content panel smoke test passed.');
  } finally {
    await context.close();
    await browser.close();
  }
}

(async () => {
  await testViewport('PC', { width: 1365, height: 768 }, false);
  await testViewport('Mobile', { width: 390, height: 844 }, true);
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
