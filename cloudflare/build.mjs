import { spawnSync } from 'node:child_process';

if (!process.env.PUBLIC_ORIGIN) throw new Error('Set PUBLIC_ORIGIN in Workers Builds to your HTTPS website origin.');
const origin = new URL(process.env.PUBLIC_ORIGIN);
if (origin.protocol !== 'https:' || origin.origin !== process.env.PUBLIC_ORIGIN.replace(/\/$/, ''))
  throw new Error('PUBLIC_ORIGIN must be an HTTPS origin without a path.');
if (!process.env.VITE_TURNSTILE_SITE_KEY || process.env.VITE_TURNSTILE_SITE_KEY.startsWith('1x000'))
  throw new Error('Set a real VITE_TURNSTILE_SITE_KEY in Workers Builds before deployment.');

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const env = { ...process.env, VITE_API_SAME_ORIGIN: 'true', VITE_ADMIN_URL: '/manage-7f3k/',
  VITE_SITE_ENV: process.env.VITE_SITE_ENV || 'preview' };
if (process.env.PUBLIC_ORIGIN) env.VITE_SITE_URL = process.env.PUBLIC_ORIGIN;
for (const args of [['--prefix', 'frontend', 'ci'], ['--prefix', 'frontend', 'run', 'content:validate'], ['--prefix', 'frontend', 'run', 'build']]) {
  const result = spawnSync(npm, args, { stdio: 'inherit', env, shell: process.platform === 'win32' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
