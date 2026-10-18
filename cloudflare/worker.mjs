import { DurableObject } from 'cloudflare:workers';
import { containerEnvironment, isBackendPath, proxyRequest } from './routing.mjs';

const idleTimeout = 10 * 60 * 1000;

export class Backend extends DurableObject {
  starting;

  constructor(ctx, env) {
    super(ctx, env);
    if (ctx.container.running) {
      void ctx.blockConcurrencyWhile(() => ctx.container.setInactivityTimeout(idleTimeout));
    }
  }

  async fetch(request) {
    this.starting ??= this.startAndWait().finally(() => { this.starting = undefined; });
    await this.starting;
    const url = new URL(request.url);
    url.protocol = 'http:';
    url.host = 'container';
    const forwarded = new Request(url, request);
    forwarded.headers.delete('host');
    return this.ctx.container.getTcpPort(8000).fetch(forwarded);
  }

  async startAndWait() {
    const container = this.ctx.container;
    if (!container.running) {
      container.start({
        image: container.images.base,
        instance: 'basic',
        enableInternet: true,
        env: containerEnvironment(this.env),
      });
    }
    await container.setInactivityTimeout(idleTimeout);
    const port = container.getTcpPort(8000);
    for (let attempt = 0; attempt < 100; attempt++) {
      try {
        const response = await port.fetch('http://container/api/health/', {
          headers: { 'X-Forwarded-Proto': 'https', 'X-Forwarded-Host': new URL(this.env.PUBLIC_ORIGIN).host },
          signal: AbortSignal.timeout(1000),
        });
        await response.body?.cancel();
        if (response.ok) return;
      } catch { /* Allow migrations and Gunicorn to finish starting. */ }
      await scheduler.wait(200);
    }
    throw new Error('Django did not become ready');
  }
}

export default {
  async fetch(request, env) {
    if (!isBackendPath(new URL(request.url).pathname)) return env.ASSETS.fetch(request);
    try {
      const response = await env.BACKEND.getByName('primary').fetch(proxyRequest(request));
      const result = new Response(response.body, response);
      result.headers.set('Cache-Control', 'no-store');
      return result;
    } catch {
      return Response.json({ message: 'Our service is temporarily unavailable. Please try again shortly.' }, {
        status: 503, headers: { 'Cache-Control': 'no-store', 'Retry-After': '30' },
      });
    }
  },
};
