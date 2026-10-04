/* OUTLAST v3.30.22 — Nightfall Event countdown */
(() => {
  'use strict';

  const VERSION = '3.30.22';
  const EVENT_NAME = 'NIGHTFALL';
  const TARGET_MONTH = 9; // October, zero-based.
  const TARGET_DAY = 1;
  const TARGET_YEAR = 2026;

  const $ = (id) => document.getElementById(id);

  function targetTime() {
    // October 1st at 12:00 AM in each player's local timezone.
    return new Date(TARGET_YEAR, TARGET_MONTH, TARGET_DAY, 0, 0, 0, 0).getTime();
  }

  function formatCountdown(ms) {
    if (ms <= 0) return '00D 00H 00M 00S';
    let total = Math.floor(ms / 1000);
    const days = Math.floor(total / 86400);
    total -= days * 86400;
    const hours = Math.floor(total / 3600);
    total -= hours * 3600;
    const minutes = Math.floor(total / 60);
    const seconds = total - minutes * 60;
    return (
      String(days).padStart(2, '0') + 'D ' +
      String(hours).padStart(2, '0') + 'H ' +
      String(minutes).padStart(2, '0') + 'M ' +
      String(seconds).padStart(2, '0') + 'S'
    );
  }

  function injectStyle() {
    if ($('v397EventStyle')) return;
    const style = document.createElement('style');
    style.id = 'v397EventStyle';
    style.textContent =
      '.v397-event-card{position:relative;overflow:hidden;margin:0 0 12px;padding:16px 18px;background:linear-gradient(120deg,#1b1622,#10151d);border:1px solid #5f456d;border-radius:14px;box-shadow:inset 0 1px 0 rgba(255,255,255,.03)}' +
      '.v397-event-card:after{content:"";position:absolute;width:180px;height:180px;right:-60px;top:-80px;border-radius:50%;background:radial-gradient(circle,rgba(178,99,255,.18),transparent 68%);pointer-events:none}' +
      '.v397-event-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;position:relative;z-index:1}' +
      '.v397-event-title{font-weight:900;font-size:18px;letter-spacing:.08em}' +
      '.v397-event-sub{font-size:11px;color:#9e8eab;margin-top:3px;letter-spacing:.04em}' +
      '.v397-event-count{font:900 20px/1.1 Arial;color:#f2d9ff;letter-spacing:.04em;white-space:nowrap;text-align:right}' +
      '.v397-event-date{margin-top:8px;font-size:11px;color:#8fa1b0;position:relative;z-index:1}' +
      '.v397-event-live{font-size:20px;font-weight:900;color:#d4ffdb}' +
      '@media(max-width:700px){.v397-event-head{display:block}.v397-event-count{text-align:left;margin-top:10px;font-size:18px}.v397-event-card{padding:14px}}';
    document.head.appendChild(style);
  }

  function getPlayPage() {
    return document.querySelector('[data-page-content="play"]');
  }

  function createCard() {
    const page = getPlayPage();
    if (!page || $('v397NightfallCard')) return;
    const cards = page.querySelector('.menu-cards');
    if (!cards) return;

    const card = document.createElement('div');
    card.id = 'v397NightfallCard';
    card.className = 'v397-event-card';
    card.innerHTML =
      '<div class="v397-event-head">' +
        '<div>' +
          '<div class="v397-event-title">🎃 NIGHTFALL EVENT</div>' +
          '<div class="v397-event-sub">LIMITED-TIME EVENT • OCTOBER 1</div>' +
        '</div>' +
        '<div id="v397EventCountdown" class="v397-event-count">--D --H --M --S</div>' +
      '</div>' +
      '<div id="v397EventDate" class="v397-event-date">Starts October 1 at 12:00 AM local time.</div>';
    cards.parentNode.insertBefore(card, cards);
  }

  function update() {
    createCard();
    const count = $('v397EventCountdown');
    const date = $('v397EventDate');
    if (!count) return;

    const remaining = targetTime() - Date.now();
    if (remaining <= 0) {
      count.textContent = EVENT_NAME + ' IS LIVE';
      count.classList.add('v397-event-live');
      if (date) date.textContent = 'The Nightfall Event is now live.';
      return;
    }

    count.textContent = formatCountdown(remaining);
    count.classList.remove('v397-event-live');

    if (date) {
      const local = new Date(targetTime());
      date.textContent = 'Starts ' + local.toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }) + ' at ' + local.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit'
      }) + ' local time.';
    }
  }

  function updateVersionMarker() {
    const title = document.querySelector('title');
    if (title && /OUTLAST v/i.test(title.textContent || '')) {
      title.textContent = 'OUTLAST v' + VERSION;
    }
    document.querySelectorAll('meta').forEach((meta) => {
      const name = (meta.getAttribute('name') || '').toLowerCase();
      if (name === 'outlast-build') meta.setAttribute('content', VERSION);
      if (name === 'build-version') meta.setAttribute('content', VERSION);
    });
  }

  function init() {
    injectStyle();
    updateVersionMarker();
    update();
    setInterval(update, 1000);
    setInterval(createCard, 1500);
  }

  window.OUTLAST_V33022 = {
    version: VERSION,
    event: EVENT_NAME,
    startsAtLocal: targetTime()
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
