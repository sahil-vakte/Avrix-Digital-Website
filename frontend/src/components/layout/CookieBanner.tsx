import { useEffect, useRef, useState } from 'react';
import { ui } from '../../content';
import { applyConsent, readConsent } from '../../lib/analytics';

// Consent pop-up. Shown until the visitor makes a choice; "Reject all" is as
// prominent as "Accept all", and nothing optional loads before consent.
export default function CookieBanner() {
  const [open, setOpen] = useState(false);
  const [decided, setDecided] = useState(true);
  const [prefs, setPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [advertising, setAdvertising] = useState(false);
  const panel = useRef<HTMLElement>(null);
  useEffect(() => {
    const c = readConsent();
    setDecided(!!c);
    setOpen(!c);
    const show = () => {
      const current = readConsent();
      setAnalytics(current?.analytics || false);
      setAdvertising(current?.advertising || false);
      setPrefs(true);
      setOpen(true);
    };
    addEventListener('cookie-preferences', show);
    return () => removeEventListener('cookie-preferences', show);
  }, []);
  useEffect(() => {
    if (open) panel.current?.focus({ preventScroll: true });
  }, [open, prefs]);
  function save(a: boolean, b: boolean) {
    applyConsent({ analytics: a, advertising: b });
    setDecided(true);
    setOpen(false);
    setPrefs(false);
  }
  if (!open)
    return decided ? (
      <button
        type="button"
        className="cookie-reopen"
        aria-label={ui.cookieSettings}
        title={ui.cookieSettings}
        onClick={() => dispatchEvent(new Event('cookie-preferences'))}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 3a9 9 0 1 0 9 9 4 4 0 0 1-4-4 4 4 0 0 1-4-4 1 1 0 0 0-1-1Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <circle cx="8.5" cy="10" r="1.2" fill="currentColor" />
          <circle cx="13" cy="15.5" r="1.2" fill="currentColor" />
          <circle cx="8" cy="15" r="1" fill="currentColor" />
        </svg>
      </button>
    ) : null;
  return (
    <section
      ref={panel}
      tabIndex={-1}
      className="cookie-card"
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-text"
    >
      <div className="cookie-head">
        <span className="cookie-icon" aria-hidden="true">
          🍪
        </span>
        <h2 id="cookie-title">{ui.cookieTitle}</h2>
      </div>
      <p id="cookie-text">
        {ui.cookieText} <a href="/cookie-policy/">{ui.cookiePolicy}</a>.
      </p>
      {prefs && (
        <fieldset className="cookie-options">
          <legend className="sr-only">{ui.preferences}</legend>
          <div className="cookie-option">
            <span>
              <strong>{ui.cookieEssential}</strong>
              <small>{ui.cookieEssentialText}</small>
            </span>
            <em>{ui.alwaysOn}</em>
          </div>
          <label className="cookie-option">
            <span>
              <strong>{ui.analytics}</strong>
              <small>{ui.cookieAnalyticsText}</small>
            </span>
            <input
              type="checkbox"
              role="switch"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
            />
          </label>
          <label className="cookie-option">
            <span>
              <strong>{ui.advertising}</strong>
              <small>{ui.cookieAdvertisingText}</small>
            </span>
            <input
              type="checkbox"
              role="switch"
              checked={advertising}
              onChange={(e) => setAdvertising(e.target.checked)}
            />
          </label>
        </fieldset>
      )}
      <div className="cookie-actions">
        <button type="button" onClick={() => save(false, false)}>
          {ui.reject}
        </button>
        {prefs ? (
          <button type="button" onClick={() => save(analytics, advertising)}>
            {ui.save}
          </button>
        ) : (
          <button type="button" onClick={() => setPrefs(true)}>
            {ui.preferences}
          </button>
        )}
        <button type="button" onClick={() => save(true, true)}>
          {ui.accept}
        </button>
      </div>
    </section>
  );
}
