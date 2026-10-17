import { beforeEach, expect, it, vi } from 'vitest';
import { applyConsent, readConsent, initConsent, track, lead } from './analytics';
beforeEach(() => {
  document.cookie = 'avrix_consent=; Max-Age=0';
  window.dataLayer = [];
  window.gtag = vi.fn();
  sessionStorage.clear();
});
it('defaults all four consent signals to denied', () => {
  initConsent();
  expect(window.gtag).toHaveBeenCalledWith('consent', 'default', {
    ad_storage: 'denied',
    analytics_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  expect(document.querySelector('script[src*="googletagmanager"]')).toBeNull();
});
it('persists explicit consent and deduplicates leads', () => {
  applyConsent({ analytics: true, advertising: false });
  expect(readConsent()).toEqual({ analytics: true, advertising: false });
  lead('abc', {});
  lead('abc', {});
  expect(vi.mocked(window.gtag).mock.calls.filter((c) => c[1] === 'generate_lead')).toHaveLength(1);
});
it('does not track after rejection', () => {
  applyConsent({ analytics: false, advertising: false });
  track('generate_lead');
  expect(vi.mocked(window.gtag).mock.calls.some((c) => c[0] === 'event')).toBe(false);
});
