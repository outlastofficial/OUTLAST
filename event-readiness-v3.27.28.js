/* OUTLAST v3.27.28 — Event Launch Readiness Preflight */
(() => {
  'use strict';
  if (window.__OUTLAST_EVENT_PREFLIGHT__) return;
  window.__OUTLAST_EVENT_PREFLIGHT__ = true;

  const API = 'https://outlast-server.onrender.com';
  const checks = {};

  async function checkEndpoint(name, path) {
    try {
      const r = await fetch(API + path + (path.includes('?') ? '&' : '?') + 'preflight=' + Date.now(), {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      checks[name] = { ok: r.ok, status: r.status };
      return checks[name];
    } catch (error) {
      checks[name] = { ok: false, error: String(error?.message || error) };
      return checks[name];
    }
  }

  async function run() {
    const target = Number(window.OUTLAST_EVENT_TARGET_MS || 0);
    checks.canonicalTarget = {
      ok: Number.isFinite(target) && target > 0,
      targetMs: target,
      targetIso: target > 0 ? new Date(target).toISOString() : null
    };

    checks.countdown = {
      ok: typeof window.OUTLAST_EVENT_TARGET_MS === 'number',
      timerInstalled: !!window.__outlastCountdownTimer
    };

    await Promise.all([
      checkEndpoint('eventState', '/api/event/state'),
      checkEndpoint('health', '/api/health')
    ]);

    checks.loginIsolation = 'No login code is modified by this preflight module.';
    checks.overall = Object.values(checks).every(v => v === 'No login code is modified by this preflight module.' || v?.ok === true);

    window.OUTLAST_EVENT_READINESS = {
      version: '3.27.28',
      checkedAt: Date.now(),
      checks: { ...checks }
    };
    return window.OUTLAST_EVENT_READINESS;
  }

  window.OUTLAST_EVENT_PREFLIGHT = { run, checks };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { run().catch(() => {}); }, { once: true });
  } else {
    run().catch(() => {});
  }
})();
