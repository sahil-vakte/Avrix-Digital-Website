export type Consent = { analytics: boolean; advertising: boolean };
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}
const denied = {
  ad_storage: 'denied',
  analytics_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
};
let current: Consent = { analytics: false, advertising: false };
let started = false;
export function readConsent(): Consent | null {
  try {
    const value = document.cookie.split('; ').find((c) => c.startsWith('avrix_consent='));
    if (!value) return null;
    const c = JSON.parse(decodeURIComponent(value.split('=').slice(1).join('='))) as Consent;
    return typeof c.analytics === 'boolean' && typeof c.advertising === 'boolean' ? c : null;
  } catch {
    return null;
  }
}
export function initConsent() {
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    ((...args: unknown[]) => {
      window.dataLayer.push(args);
    });
  window.gtag('consent', 'default', denied);
  const saved = readConsent();
  if (saved) applyConsent(saved, false);
}
export function applyConsent(consent: Consent, persist = true) {
  current = consent;
  if (!window.gtag) initConsent();
  window.gtag('consent', 'update', {
    analytics_storage: consent.analytics ? 'granted' : 'denied',
    ad_storage: consent.advertising ? 'granted' : 'denied',
    ad_user_data: consent.advertising ? 'granted' : 'denied',
    ad_personalization: consent.advertising ? 'granted' : 'denied',
  });
  if (persist)
    document.cookie = `avrix_consent=${encodeURIComponent(JSON.stringify(consent))}; Max-Age=15552000; Path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
  const ga = import.meta.env.VITE_GA4_ID as string | undefined;
  const gtm = import.meta.env.VITE_GTM_ID as string | undefined;
  if (ga) (window as unknown as Record<string, unknown>)[`ga-disable-${ga}`] = !consent.analytics;
  if (!consent.analytics) {
    document.cookie.split(';').forEach((c) => {
      const name = c.trim().split('=')[0];
      if (/^(_ga|_gcl)/.test(name)) {
        for (const domain of [
          '',
          `; Domain=${location.hostname}`,
          `; Domain=.${location.hostname}`,
        ])
          document.cookie = `${name}=; Max-Age=0; Path=/${domain}`;
      }
    });
  }
  if ((consent.analytics || consent.advertising) && !started && (ga || gtm)) {
    started = true;
    const script = document.createElement('script');
    script.async = true;
    if (gtm) {
      window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
      script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtm)}`;
    } else {
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga!)}`;
      window.gtag('js', new Date());
      window.gtag('config', ga, { cookie_expires: 34128000 });
    }
    document.head.append(script);
  }
}
export function track(event: string, params: Record<string, unknown> = {}) {
  if (current.analytics) window.gtag?.('event', event, params);
}
export function lead(id: string, params: Record<string, unknown>) {
  if (!current.analytics) return;
  try {
    if (sessionStorage.getItem(`lead:${id}`)) return;
    sessionStorage.setItem(`lead:${id}`, '1');
  } catch {
    /* tracking remains optional */
  }
  track('generate_lead', params);
}
