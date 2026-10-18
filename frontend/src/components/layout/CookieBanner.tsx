import { useEffect, useState } from 'react';
import { ui } from '../../content';
import { applyConsent, readConsent } from '../../lib/analytics';
export default function CookieBanner() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [advertising, setAdvertising] = useState(false);
  useEffect(() => {
    setOpen(!readConsent());
    const show = () => {
      const c = readConsent();
      setAnalytics(c?.analytics || false);
      setAdvertising(c?.advertising || false);
      setOpen(true);
      setPrefs(true);
    };
    addEventListener('cookie-preferences', show);
    return () => removeEventListener('cookie-preferences', show);
  }, []);
  function save(a: boolean, b: boolean) {
    applyConsent({ analytics: a, advertising: b });
    setOpen(false);
  }
  if (!open) return null;
  return (
    <section className="cookie-card" aria-label={ui.cookieTitle}>
      <h2>{ui.cookieTitle}</h2>
      <p>{ui.cookieText}</p>
      <a href="/cookie-policy/">{ui.legal}</a>
      {prefs && (
        <fieldset>
          <label>
            <input
              type="checkbox"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
            />
            {ui.analytics}
          </label>
          <label>
            <input
              type="checkbox"
              checked={advertising}
              onChange={(e) => setAdvertising(e.target.checked)}
            />
            {ui.advertising}
          </label>
        </fieldset>
      )}
      <div className="cookie-actions">
        <button onClick={() => save(true, true)}>{ui.accept}</button>
        <button onClick={() => save(false, false)}>{ui.reject}</button>
      </div>
      <button onClick={() => (prefs ? save(analytics, advertising) : setPrefs(true))}>
        {prefs ? ui.save : ui.preferences}
      </button>
    </section>
  );
}
