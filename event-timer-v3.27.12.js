/* OUTLAST v3.27.28 — canonical event countdown
 * Single source of truth for the October event target.
 * Scheduled: Saturday, October 3, 2026 at 11:00 AM ET (15:00 UTC).
 */
(() => {
  'use strict';

  const EVENT_TARGET_MS = Date.UTC(2026, 9, 3, 15, 0, 0, 0); // Launch schedule unchanged; canonical event timestamp.
  window.OUTLAST_EVENT_TARGET_MS = EVENT_TARGET_MS;
  window.OUTLAST_EVENT_TARGET_ISO = new Date(EVENT_TARGET_MS).toISOString();

  function formatCountdown(ms) {
    ms = Math.max(0, Number(ms) || 0);
    if (ms <= 0) return '🎃 LIVE NOW!';
    const d = Math.floor(ms / 86400000);
    const h = Math.floor(ms / 3600000) % 24;
    const m = Math.floor(ms / 60000) % 60;
    const s = Math.floor(ms / 1000) % 60;
    return d + 'd ' + String(h).padStart(2, '0') + 'h ' +
      String(m).padStart(2, '0') + 'm ' + String(s).padStart(2, '0') + 's';
  }

  function ensureBox(id, html, style) {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      el.style.cssText = style;
      el.innerHTML = html;
      document.body.appendChild(el);
    }
    return el;
  }

  function install() {
    // Remove any stale timer UI left behind by older cached builds.
    ['outlastEventCountdown', 'outlastMenuCountdown'].forEach(id => {
      const old = document.getElementById(id);
      if (old) old.remove();
    });

    // Stop older timer intervals when they exposed the old global handle.
    try {
      if (window.__outlastCountdownTimer) {
        clearInterval(window.__outlastCountdownTimer);
        window.__outlastCountdownTimer = null;
      }
    } catch (_) {}

    const top = ensureBox(
      'outlastEventCountdown',
      '',
      'position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:99999;background:rgba(10,14,20,.97);border:2px solid #d6a84f;border-radius:12px;padding:8px 14px;color:#fff;font:700 14px Arial,sans-serif;text-align:center;box-shadow:0 5px 22px rgba(0,0,0,.45);pointer-events:none;min-width:210px;display:block;visibility:visible;opacity:1;'
    );

    const menu = document.getElementById('menu');
    if (menu) {
      const menuBox = ensureBox(
        'outlastMenuCountdown',
        '<div style="font-weight:900;letter-spacing:1.5px;color:#d6a84f;font-size:12px">🎃 NIGHTFALL EVENT</div><div id="outlastMenuEventTime" style="font-size:21px;font-weight:900;margin-top:4px">Loading…</div><div style="font-size:11px;color:#9eb0c1;margin-top:3px">October 3, 2026 • 11:00 AM ET</div>',
        'margin:10px 0 12px;padding:12px 14px;border:2px solid #d6a84f;border-radius:14px;background:#111820;box-shadow:0 8px 28px rgba(0,0,0,.25);text-align:center;display:block;visibility:visible;opacity:1;position:relative;z-index:5;pointer-events:none;'
      );
      const summary = document.getElementById('menuSummary');
      if (summary && menuBox.parentNode === document.body) summary.insertAdjacentElement('afterend', menuBox);
    }

    const update = () => {
      const value = formatCountdown(EVENT_TARGET_MS - Date.now());
      top.innerHTML =
        '<div style="color:#d6a84f;font-size:11px;letter-spacing:1px">OUTLAST OCTOBER EVENT</div>' +
        '<div style="font-size:18px;margin-top:2px">' + value + '</div>';
      const mini = document.getElementById('outlastMenuEventTime');
      if (mini) mini.textContent = value;
    };

    update();
    window.__outlastCountdownTimer = setInterval(update, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
