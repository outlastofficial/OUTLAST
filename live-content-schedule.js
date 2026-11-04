(function () {
  'use strict';
  if (window.__OUTLAST_LIVE_CONTENT_UI__) return;
  window.__OUTLAST_LIVE_CONTENT_UI__ = true;

  var host = String(window.location && window.location.hostname || '').toLowerCase();
  var isTester = host === 'outlast-test.onrender.com' || host.indexOf('outlast-test-') === 0;
  var API = isTester
    ? 'https://outlast-test-server.onrender.com/api/live-content'
    : 'https://outlast-server.onrender.com/api/live-content';
  var overlay = null, panelBody = null, statusLine = null;
  var serverClockOffset = 0, countdownTargets = [];

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }
  function dateText(value) {
    var n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return 'Not scheduled';
    return new Date(n).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }
  function formatCountdown(milliseconds) {
    var total = Math.max(0, Math.floor(milliseconds / 1000));
    var days = Math.floor(total / 86400);
    var hours = Math.floor((total % 86400) / 3600);
    var minutes = Math.floor((total % 3600) / 60);
    var seconds = total % 60;
    return (days ? days + 'd ' : '') + String(hours).padStart(2, '0') + 'h ' + String(minutes).padStart(2, '0') + 'm ' + String(seconds).padStart(2, '0') + 's';
  }
  function addCountdown(card, label, timestamp) {
    var line = el('div', 'olc-meta olc-countdown', label + ': calculating…');
    card.appendChild(line);
    var at = Number(timestamp);
    if (Number.isFinite(at) && at > 0) countdownTargets.push({ node: line, label: label, at: at });
    else line.textContent = label + ': Not scheduled';
  }
  function updateCountdowns() {
    var now = Date.now() + serverClockOffset;
    countdownTargets.forEach(function (target) {
      var remaining = target.at - now;
      target.node.textContent = target.label + ': ' + (remaining <= 0 ? 'Updating now…' : formatCountdown(remaining));
    });
  }
  function section(title, badge, description) {
    var card = el('section', 'olc-card');
    var head = el('div', 'olc-card-head');
    head.appendChild(el('h3', '', title));
    head.appendChild(el('span', 'olc-badge', badge));
    card.appendChild(head);
    card.appendChild(el('p', 'olc-description', description));
    return card;
  }
  function syncReleaseBadge() {
    var meta = document.querySelector('meta[name="outlast-build"]') || document.querySelector('meta[name="build-version"]');
    var build = String(meta && meta.getAttribute('content') || '').replace(/^v/i, '').trim();
    if (!build) return;
    if (window.OUTLAST_MANDATORY_UPDATE_CHECK && typeof window.OUTLAST_MANDATORY_UPDATE_CHECK === 'object') {
      if (window.OUTLAST_MANDATORY_UPDATE_CHECK.version !== build) window.OUTLAST_MANDATORY_UPDATE_CHECK.version = build;
    }
    var badge = document.querySelector('#outlastMandatoryUpdateCheck .ver');
    var label = 'v' + build + ' • CURRENT BUILD';
    if (badge && badge.textContent !== label) badge.textContent = label;
  }
  function buildShell() {
    if (overlay) return overlay;
    var style = el('style');
    style.textContent = '#outlastLiveContentButton{position:fixed;left:12px;top:12px;z-index:119;border:1px solid #39708d;border-radius:11px;padding:9px 12px;background:linear-gradient(135deg,#102b3b,#101923);color:#eaf7ff;font:800 12px Arial;letter-spacing:.04em;box-shadow:0 5px 18px #0008;cursor:pointer}#outlastLiveContentButton:hover{filter:brightness(1.15)}#outlastLiveContentOverlay{position:fixed;inset:0;z-index:130000;display:none;align-items:center;justify-content:center;padding:14px;box-sizing:border-box;background:rgba(2,7,12,.84);backdrop-filter:blur(6px);font-family:Arial,sans-serif;color:#f3f8fc}#outlastLiveContentOverlay .olc-shell{width:min(760px,96vw);max-height:88vh;overflow:auto;box-sizing:border-box;padding:20px;border:1px solid #31536b;border-radius:20px;background:linear-gradient(145deg,#142333,#09121b);box-shadow:0 24px 80px #000a}#outlastLiveContentOverlay .olc-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px}#outlastLiveContentOverlay h2{margin:0 0 5px;font-size:26px}#outlastLiveContentOverlay .olc-sub{margin:0;color:#8faabd;font-size:12px}#outlastLiveContentOverlay .olc-close{border:1px solid #405d72;border-radius:9px;padding:8px 11px;background:#172b3b;color:#fff;font-weight:800;cursor:pointer}#outlastLiveContentOverlay .olc-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}#outlastLiveContentOverlay .olc-card{min-width:0;padding:13px;border:1px solid #2a4356;border-radius:14px;background:linear-gradient(145deg,#101d29,#0c151e)}#outlastLiveContentOverlay .olc-card-head{display:flex;justify-content:space-between;align-items:center;gap:8px}#outlastLiveContentOverlay h3{margin:0;font-size:15px;color:#e5f4ff}#outlastLiveContentOverlay .olc-badge{flex:none;padding:4px 7px;border-radius:999px;border:1px solid #3b6b89;background:#142d40;color:#8fd4ff;font-size:10px;font-weight:900;text-transform:uppercase}#outlastLiveContentOverlay .olc-description{color:#bdcbd6;font-size:13px;line-height:1.45;margin:10px 0}#outlastLiveContentOverlay .olc-meta{color:#8199aa;font-size:11px;line-height:1.6}#outlastLiveContentOverlay .olc-countdown{margin-top:7px;color:#8fd4ff;font-weight:800;letter-spacing:.02em}#outlastLiveContentOverlay .olc-month{grid-column:1/-1}#outlastLiveContentOverlay .olc-recap{margin:8px 0 0;padding-left:19px;color:#cbd8e2;font-size:12px;line-height:1.65}#outlastLiveContentOverlay .olc-footer{margin-top:12px;color:#7890a2;font-size:11px}#outlastLiveContentOverlay .olc-error{color:#ffb5a8}@media(max-width:600px){#outlastLiveContentOverlay .olc-grid{grid-template-columns:1fr}#outlastLiveContentOverlay .olc-month{grid-column:auto}#outlastLiveContentOverlay .olc-shell{padding:15px}#outlastLiveContentOverlay h2{font-size:22px}}';
    document.head.appendChild(style);

    var button = el('button', '', '📡 LIVE CONTENT');
    button.id = 'outlastLiveContentButton';
    button.type = 'button';
    button.setAttribute('aria-haspopup', 'dialog');
    button.addEventListener('click', openPanel);
    document.body.appendChild(button);

    overlay = el('div');
    overlay.id = 'outlastLiveContentOverlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'OUTLAST live content schedule');
    var shell = el('div', 'olc-shell');
    var top = el('div', 'olc-top');
    var heading = el('div');
    heading.appendChild(el('h2', '', '📡 OUTLAST LIVE OPERATIONS'));
    heading.appendChild(el('p', 'olc-sub', 'Live countdowns • Fresh content every 3 days • Saturday-to-Saturday weekly updates • Monthly finales'));
    var close = el('button', 'olc-close', 'CLOSE');
    close.type = 'button';
    close.addEventListener('click', closePanel);
    top.append(heading, close);
    panelBody = el('div', 'olc-grid');
    statusLine = el('p', 'olc-footer', 'Connecting to the OUTLAST live schedule…');
    shell.append(top, panelBody, statusLine);
    overlay.appendChild(shell);
    overlay.addEventListener('click', function (event) { if (event.target === overlay) closePanel(); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && overlay.style.display === 'flex') closePanel(); });
    document.body.appendChild(overlay);
    return overlay;
  }
  function render(data) {
    if (!panelBody) return;
    panelBody.textContent = '';
    countdownTargets = [];
    serverClockOffset = Date.parse(data.serverTime) - Date.now();
    var small = data.smallAddition || {};
    var smallCard = section('Every 3 Days: ' + (small.title || 'New Field Addition'), 'Cycle ' + (small.cycle || '?'), small.description || 'A new field report is being prepared.');
    smallCard.appendChild(el('div', 'olc-meta', (small.category || 'New content') + ' • Available: ' + dateText(small.startsAt) + ' → ' + dateText(small.endsAt)));
    addCountdown(smallCard, 'Next content drop in', small.nextAt || data.nextSmallAdditionAt || small.endsAt);
    panelBody.appendChild(smallCard);

    var weekly = data.weeklyEvent || {};
    var weeklyCard = section('Weekly Update: ' + (weekly.title || 'Next Operation'), weekly.active ? 'LIVE NOW' : 'UPCOMING', (weekly.subtitle ? weekly.subtitle + ' — ' : '') + (weekly.objective || 'A new weekly operation is on the way.'));
    weeklyCard.appendChild(el('div', 'olc-meta', 'Reward: ' + (weekly.reward || 'Event archive entry') + ' • Saturday → Saturday (Eastern Time) • ' + dateText(weekly.startsAt) + ' → ' + dateText(weekly.endsAt)));
    addCountdown(weeklyCard, weekly.active ? 'Next weekly chapter in' : 'Weekly update starts in', weekly.nextAt || data.nextWeeklyEventAt);
    panelBody.appendChild(weeklyCard);

    var monthly = data.monthlyEvent || {};
    var monthlyCard = section('Monthly Major Event: ' + (monthly.title || 'Monthly Finale'), monthly.active ? 'LIVE ALL MONTH' : 'NEXT MONTH', monthly.objective || 'This month’s ongoing investigation builds toward a final operation.');
    monthlyCard.className += ' olc-month';
    monthlyCard.appendChild(el('div', 'olc-meta', 'Theme: ' + (monthly.theme || 'Monthly outbreak') + ' • ' + dateText(monthly.startsAt) + ' → ' + dateText(monthly.endsAt)));
    addCountdown(monthlyCard, monthly.active ? 'Monthly event ends in' : 'Monthly event starts in', monthly.active ? monthly.endsAt : (data.nextMonthlyEventAt || monthly.startsAt));
    var recap = Array.isArray(monthly.monthlyRecap) ? monthly.monthlyRecap : [];
    if (recap.length) {
      var list = el('ul', 'olc-recap');
      recap.forEach(function (item) { list.appendChild(el('li', '', item)); });
      monthlyCard.appendChild(el('div', 'olc-meta', 'THIS MONTH’S FIELD REPORTS'));
      monthlyCard.appendChild(list);
    } else {
      monthlyCard.appendChild(el('div', 'olc-meta', 'The finale will bring together this month’s small additions and weekly update chapters.'));
    }
    panelBody.appendChild(monthlyCard);
    statusLine.className = 'olc-footer';
    statusLine.textContent = 'Server schedule: ' + dateText(Date.parse(data.serverTime)) + ' • Weekly chapters start Saturday at 12:00 AM Eastern; other dates are shown in your local timezone.';
    updateCountdowns();
    window.OUTLAST_LIVE_CONTENT = data;
  }
  async function refresh() {
    try {
      var response = await fetch(API, { method: 'GET', cache: 'no-store', headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Live schedule unavailable (' + response.status + ')');
      var data = await response.json();
      if (!data || !data.ok || !data.smallAddition || !data.weeklyEvent || !data.monthlyEvent) throw new Error('Live schedule response was incomplete');
      render(data);
      return data;
    } catch (error) {
      if (statusLine) {
        statusLine.textContent = String(error && error.message || 'Could not connect to the live schedule.') + ' • Try again in a moment.';
        statusLine.className = 'olc-footer olc-error';
      }
      window.OUTLAST_LIVE_CONTENT_ERROR = String(error && error.message || error);
      return null;
    }
  }
  function openPanel() {
    buildShell();
    overlay.style.display = 'flex';
    refresh();
  }
  function closePanel() { if (overlay) overlay.style.display = 'none'; }
  function install() {
    buildShell();
    syncReleaseBadge();
    try {
      var releaseObserver = new MutationObserver(syncReleaseBadge);
      releaseObserver.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['content'] });
      window.OUTLAST_LIVE_CONTENT_RELEASE_OBSERVER = releaseObserver;
    } catch (_) {}
    refresh();
    window.OUTLAST_LIVE_CONTENT_REFRESH = refresh;
    window.setInterval(updateCountdowns, 1000);
    if (typeof updates !== 'undefined' && Array.isArray(updates) && !updates.some(function (item) { return item && String(item[0]).indexOf('v4.6.12 — Saturday-to-Saturday Live Operations') === 0; })) {
      updates.unshift(['v4.6.12 — Saturday-to-Saturday Live Operations', 'Added live server-synchronized countdowns for the next three-day content drop, Saturday-to-Saturday weekly chapter, and monthly event transition. Weekly chapters start at midnight Eastern, including daylight-saving changes. Existing saves and leaderboards are unchanged.']);
    }
    if (typeof helpArticles !== 'undefined' && Array.isArray(helpArticles) && !helpArticles.some(function (item) { return item && item[0] === 'How does the OUTLAST Live Content schedule work?'; })) {
      helpArticles.unshift(['How does the OUTLAST Live Content schedule work?', 'Events & Live Content', 'Open LIVE CONTENT from the game screen to see server-synchronized countdowns for the next three-day content drop, next Saturday chapter, and monthly event transition. A small addition rotates every 72 hours. Weekly updates run from Saturday midnight Eastern to the following Saturday midnight Eastern and continue the story in numbered parts. The schedule adjusts for daylight-saving time. The major monthly event stays active all month, with weekly updates and three-day additions layered on top. The server controls all unlock times; dates are displayed in your local timezone.']);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
  window.setInterval(refresh, 5 * 60 * 1000);
})();