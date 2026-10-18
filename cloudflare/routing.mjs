export function isBackendPath(path) {
  return ['/api', '/manage-7f3k', '/admin-setup', '/static'].some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

export function proxyRequest(request) {
  const url = new URL(request.url);
  const forwarded = new Request(request);
  // Always replace proxy headers supplied by callers.
  forwarded.headers.set('X-Forwarded-Host', url.host);
  forwarded.headers.set('X-Forwarded-Proto', 'https');
  forwarded.headers.set('X-Real-IP', request.headers.get('CF-Connecting-IP') || 'unknown');
  forwarded.headers.delete('Forwarded');
  forwarded.headers.delete('X-Forwarded-For');
  return forwarded;
}

export function containerEnvironment(bindings) {
  const required = ['PUBLIC_ORIGIN', 'DATABASE_URL', 'DJANGO_SECRET_KEY', 'IP_HASH_SALT', 'TURNSTILE_SECRET_KEY'];
  for (const key of required) {
    if (!bindings[key]) throw new Error(`Missing Cloudflare setting: ${key}`);
  }
  const keys = [...required, 'SUPERADMIN_BOOTSTRAP_TOKEN', 'EMAIL_HOST', 'EMAIL_PORT',
    'EMAIL_HOST_USER', 'EMAIL_HOST_PASSWORD', 'EMAIL_USE_TLS', 'DEFAULT_FROM_EMAIL',
    'ENQUIRY_NOTIFY_TO', 'BOOKING_URL', 'SENTRY_DSN'];
  return {
    ...Object.fromEntries(keys.filter((key) => bindings[key] !== undefined).map((key) => [key, String(bindings[key])])),
    DJANGO_SETTINGS_MODULE: 'config.settings.cloudflare',
  };
}
