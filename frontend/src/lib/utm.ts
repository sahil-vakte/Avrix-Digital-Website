export const attributionKeys = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid',
  'msclkid',
] as const;
export function captureAttribution(
  storage: Storage,
  url: string,
  referrer: string,
): Record<string, string> {
  try {
    const old = storage.getItem('avrix_attribution');
    if (old) return JSON.parse(old) as Record<string, string>;
  } catch {
    /* Storage may be disabled. */
  }
  const parsed = new URL(url);
  const data: Record<string, string> = {
    landing_page: (parsed.pathname + parsed.search).slice(0, 300),
    referrer: referrer.slice(0, 300),
  };
  for (const key of attributionKeys)
    data[key] = (parsed.searchParams.get(key) || '').slice(0, key.endsWith('clid') ? 255 : 150);
  try {
    storage.setItem('avrix_attribution', JSON.stringify(data));
  } catch {
    /* Submission can still proceed. */
  }
  return data;
}

export function currentAttribution(): Record<string, string> {
  try {
    return captureAttribution(sessionStorage, location.href, document.referrer);
  } catch {
    return { landing_page: location.pathname, referrer: document.referrer.slice(0, 300) };
  }
}
