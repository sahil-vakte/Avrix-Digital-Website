import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isBackendPath, proxyRequest, containerEnvironment } from './routing.mjs';

test('routes Django URLs without capturing similarly named website pages', () => {
  for (const path of ['/api', '/api/enquiries/', '/admin-setup/', '/manage-7f3k/login/', '/static/admin/base.css']) assert.ok(isBackendPath(path));
  for (const path of ['/', '/services/', '/solutions/wims/', '/api-help', '/manage-7f3k-other']) assert.equal(isBackendPath(path), false);
});
test('overwrites caller-supplied proxy identity and preserves CSRF cookies', () => {
  const request = new Request('https://example.workers.dev/manage-7f3k/', { headers: {
    'X-Forwarded-Host': 'attacker.test', 'X-Forwarded-Proto': 'http', 'X-Real-IP': 'spoofed',
    'CF-Connecting-IP': '192.0.2.1', Cookie: 'csrftoken=example',
  } });
  const proxied = proxyRequest(request);
  assert.equal(proxied.headers.get('X-Forwarded-Host'), 'example.workers.dev');
  assert.equal(proxied.headers.get('X-Forwarded-Proto'), 'https');
  assert.equal(proxied.headers.get('X-Real-IP'), '192.0.2.1');
  assert.equal(proxied.headers.get('Cookie'), 'csrftoken=example');
});
test('requires persistent backend settings and excludes arbitrary Worker bindings', () => {
  assert.throws(() => containerEnvironment({}), /Missing Cloudflare setting/);
  const settings = Object.fromEntries(['PUBLIC_ORIGIN', 'DATABASE_URL', 'DJANGO_SECRET_KEY', 'IP_HASH_SALT', 'TURNSTILE_SECRET_KEY'].map((key) => [key, 'example']));
  const env = containerEnvironment({ ...settings, ASSETS: {}, OTHER_SECRET: 'private' });
  assert.equal(env.DJANGO_SETTINGS_MODULE, 'config.settings.cloudflare');
  assert.equal(env.OTHER_SECRET, undefined);
});
