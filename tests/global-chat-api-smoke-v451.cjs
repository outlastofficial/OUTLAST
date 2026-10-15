'use strict';

const assert = require('node:assert/strict');

const endpoints = [
  { name: 'production', base: 'https://outlast-server.onrender.com', service: 'outlast-server' },
  { name: 'tester', base: 'https://outlast-test-server.onrender.com', service: 'outlast-test-server' },
];

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function requestJson(url, label) {
  let lastError = null;
  for (let attempt = 1; attempt <= 4; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);
    try {
      const response = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Origin': 'https://outlastofficial.github.io',
        },
        signal: controller.signal,
      });
      const bodyText = await response.text();
      let body;
      try { body = JSON.parse(bodyText); }
      catch (_) { throw new Error(label + ' returned non-JSON HTTP ' + response.status); }

      assert.equal(response.ok, true, label + ' returned HTTP ' + response.status + ': ' + String(body.error || body.status || 'request failed'));
      assert.equal(body.ok === true || body.status === 'online', true, label + ' did not report a healthy OUTLAST response');
      if (attempt > 1) console.log(label + ' recovered after retry ' + attempt);
      return { response, body };
    } catch (error) {
      lastError = error;
      if (attempt < 4) {
        console.log(label + ' attempt ' + attempt + ' failed (' + String(error.message || error) + '); retrying.');
        await sleep(2000 * attempt);
      }
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error(label + ' failed after four attempts: ' + String(lastError && lastError.message || lastError));
}

(async () => {
  for (const endpoint of endpoints) {
    const healthResult = await requestJson(endpoint.base + '/api/health?chatSmoke=' + Date.now(), endpoint.name + ' health');
    const healthShape = {
      httpStatus: healthResult.response.status,
      keys: Object.keys(healthResult.body).sort(),
      ok: healthResult.body.ok === true,
      status: typeof healthResult.body.status === 'string' ? healthResult.body.status : null,
      game: typeof healthResult.body.game === 'string' ? healthResult.body.game : null,
      version: typeof healthResult.body.version === 'string' ? healthResult.body.version : null,
      service: typeof healthResult.body.service === 'string' ? healthResult.body.service : null,
    };
    console.log(endpoint.name + ' sanitized health response shape: ' + JSON.stringify(healthShape));
    const modernHealth = healthResult.body.status === 'online' && healthResult.body.game === 'OUTLAST';
    const deployedHealth = healthResult.body.ok === true &&
      healthResult.body.service === endpoint.service &&
      typeof healthResult.body.version === 'string';
    assert.equal(modernHealth || deployedHealth, true,
      endpoint.name + ' health endpoint returned an unexpected shape: ' + JSON.stringify(healthShape));

    const chatResult = await requestJson(endpoint.base + '/api/chat?limit=1&chatSmoke=' + Date.now(), endpoint.name + ' chat history');
    assert.equal(chatResult.body.ok, true, endpoint.name + ' chat-history endpoint must return ok:true');
    assert.equal(Array.isArray(chatResult.body.messages), true, endpoint.name + ' chat history must be an array');
    const chatVersion = chatResult.body.serverVersion || chatResult.body.version;
    assert.ok(String(chatVersion || '').length > 0, endpoint.name + ' chat API must include its server version');

    const allowOrigin = chatResult.response.headers.get('access-control-allow-origin');
    assert.ok(allowOrigin === '*' || allowOrigin === 'https://outlastofficial.github.io' || allowOrigin === 'https://outlast-test.onrender.com',
      endpoint.name + ' chat API must permit browser access via CORS');

    // Never print user messages or usernames from real chat history.
    console.log(endpoint.name + ' API is reachable; server=' + chatResult.body.serverVersion +
      '; messages returned=' + chatResult.body.messages.length + '; CORS=' + allowOrigin);
  }
  console.log('OUTLAST production and tester chat API smoke test passed (read-only).');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
