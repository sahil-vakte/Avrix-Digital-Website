/**
 * Keeps at most one overlay (consultation, cookie preferences, sticky consultation menu,
 * mobile menu) open at a time. An overlay announces itself when it opens and
 * closes when another one announces.
 */
const OPEN = 'avrix-overlay-open';
const CLOSED = 'avrix-overlay-closed';

export function announceOpen(id: string) {
  dispatchEvent(new CustomEvent(OPEN, { detail: id }));
}
export function announceClosed(id: string) {
  dispatchEvent(new CustomEvent(CLOSED, { detail: id }));
}
/** Calls `close` whenever a different overlay opens. Returns an unsubscribe. */
export function closeWhenOtherOpens(id: string, close: () => void) {
  const handler = (e: Event) => {
    if ((e as CustomEvent<string>).detail !== id) close();
  };
  addEventListener(OPEN, handler);
  return () => removeEventListener(OPEN, handler);
}
/** Reports whether any overlay is open, for elements that should step aside. */
export function trackOverlays(onChange: (open: boolean) => void) {
  let count = 0;
  const opened = () => onChange(++count > 0);
  const closed = () => {
    count = Math.max(0, count - 1);
    onChange(count > 0);
  };
  addEventListener(OPEN, opened);
  addEventListener(CLOSED, closed);
  return () => {
    removeEventListener(OPEN, opened);
    removeEventListener(CLOSED, closed);
  };
}
/** Opens the cookie preferences modal from anywhere. */
export const openCookiePreferences = () => dispatchEvent(new Event('cookie-preferences'));
