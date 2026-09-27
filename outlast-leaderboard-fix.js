/* OUTLAST v3.9.4 — reliable leaderboard saving */
(() => {
  'use strict';

  const API = 'https://outlast-server.onrender.com/api/leaderboard';
  const KEY = 'outlastLeaderboardPendingV394';
  const MAX_QUEUE = 50;

  const safeJson = (value, fallback) => {
    try { return JSON.parse(value); } catch (_) { return fallback; }
  };

  const cleanName = value => String(value ?? '').trim().replace(/\\s+/g, ' ').slice(0, 18);

  function loadQueue() {
    const q = safeJson(localStorage.getItem(KEY) || '[]', []);
    return Array.isArray(q) ? q : [];
  }

  function saveQueue(q) {
    try {
      localStorage.setItem(KEY, JSON.stringify(q.slice(-MAX_QUEUE)));
    } catch (_) {}
  }

  function queueEntry(entry) {
    if (!entry || typeof entry !== 'object') return;
    const name = cleanName(entry.name);
    if (!name || name.toLowerCase() === 'tester' || name.toLowerCase() === 'admin' || name.toLowerCase() === 'administrator') return;
    const normalized = {
      ...entry,
      name,
      score: Math.max(0, Math.floor(Number(entry.score) || 0)),
      level: Math.max(1, Math.floor(Number(entry.level) || 1)),
      kills: Math.max(0, Math.floor(Number(entry.kills) || 0)),
      date: String(entry.date || new Date().toLocaleDateString()).slice(0, 40)
    };
    const q = loadQueue();
    const key = name.toLowerCase();
    const i = q.findIndex(x => cleanName(x?.name).toLowerCase() === key);
    if (i >= 0) q[i] = Number(q[i].score || 0) >= normalized.score ? q[i] : normalized;
    else q.push(normalized);
    saveQueue(q);
  }

  async function sendEntry(entry) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(entry),
        keepalive: true,
        signal: controller.signal
      });
      if (!res.ok) return false;
      const data = await res.json().catch(() => null);
      return !!(data && data.ok);
    } catch (_) {
      return false;
    } finally {
      clearTimeout(timer);
    }
  }

  async function flush() {
    let q = loadQueue();
    if (!q.length) return;
    const left = [];
    for (const entry of q) {
      const ok = await sendEntry(entry);
      if (!ok) {
        left.push(entry);
        break;
      }
    }
    saveQueue(left);
  }

  function localBestEntry() {
    try {
      const username = cleanName(
        typeof currentUsername !== 'undefined' ? currentUsername :
        (window.save?.username || window.save?.name || '')
      );
      if (!username) return null;
      const list = Array.isArray(window.save?.leaderboard) ? window.save.leaderboard : [];
      const key = username.toLowerCase();
      const local = list.find(x => cleanName(x?.name).toLowerCase() === key);
      if (!local) return null;
      return {
        ...local,
        name: username,
        score: Math.floor(Number(local.score) || 0),
        level: Math.max(1, Math.floor(Number(local.level) || 1)),
        kills: Math.max(0, Math.floor(Number(local.kills) || 0)),
        date: local.date || new Date().toLocaleDateString()
      };
    } catch (_) { return null; }
  }

  const originalSubmit = typeof window.submitServerLeaderboard === 'function'
    ? window.submitServerLeaderboard.bind(window)
    : null;

  window.submitServerLeaderboard = async function(entry) {
    queueEntry(entry);
    const q = loadQueue();
    const key = cleanName(entry?.name).toLowerCase();
    const current = q.find(x => cleanName(x?.name).toLowerCase() === key) || entry;
    const ok = await sendEntry(current);
    if (ok) {
      saveQueue(loadQueue().filter(x => cleanName(x?.name).toLowerCase() !== key || Number(x.score || 0) > Number(current.score || 0)));
      return {ok:true, updated:true, entry:current};
    }
    setTimeout(flush, 1000);
    if (originalSubmit && !window.__outlastLeaderboardFixFallbackUsed) {
      window.__outlastLeaderboardFixFallbackUsed = true;
      try { return await originalSubmit(entry); } catch (_) {}
    }
    return null;
  };

  function install() {
    const local = localBestEntry();
    if (local) queueEntry(local);
    flush();
    setInterval(flush, 15000);
    window.addEventListener('online', flush);
    window.addEventListener('pagehide', () => {
      const entry = localBestEntry();
      if (!entry) return;
      queueEntry(entry);
      try {
        navigator.sendBeacon?.(API, new Blob([JSON.stringify(entry)], {type:'application/json'}));
      } catch (_) {}
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, {once:true});
  else install();
})();
