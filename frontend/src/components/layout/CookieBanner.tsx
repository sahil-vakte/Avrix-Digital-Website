import { useEffect, useRef, useState } from 'react';
import { ui } from '../../content';
import { applyConsent, readConsent } from '../../lib/analytics';
import {
  announceClosed,
  announceOpen,
  closeWhenOtherOpens,
  trackOverlays,
} from '../../lib/overlay';

/**
 * Cookie consent. On a first visit a non-blocking banner asks for a choice;
 * "Cookie preferences" in the footer opens the same choices as a modal.
 * Reject is as prominent as accept, and nothing optional loads before consent.
 */
export default function CookieBanner() {
  const [decided, setDecided] = useState(true);
  const [modal, setModal] = useState(false);
  const [prefs, setPrefs] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [advertising, setAdvertising] = useState(false);
  const banner = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  useEffect(() => {
    setDecided(!!readConsent());
    const show = () => {
      const current = readConsent();
      setAnalytics(current?.analytics || false);
      setAdvertising(current?.advertising || false);
      opener.current = document.activeElement as HTMLElement;
      setPrefs(true);
      setModal(true);
    };
    addEventListener('cookie-preferences', show);
    const offOther = closeWhenOtherOpens('cookies', () => setModal(false));
    const offTrack = trackOverlays(setHidden);
    return () => {
      removeEventListener('cookie-preferences', show);
      offOther();
      offTrack();
    };
  }, []);
  useEffect(() => {
    if (!modal) return;
    const el = dialog.current;
    announceOpen('cookies');
    el?.showModal();
    return () => {
      el?.close();
      announceClosed('cookies');
      setPrefs(false);
      if (opener.current?.isConnected) opener.current.focus();
    };
  }, [modal]);
  function save(a: boolean, b: boolean) {
    applyConsent({ analytics: a, advertising: b });
    setDecided(true);
    setModal(false);
    setPrefs(false);
  }
  const body = (
    <>
      <div className="cookie-head">
        <h2 id="cookie-title">{ui.cookieTitle}</h2>
        {modal && (
          <button type="button" className="modal-close" onClick={() => setModal(false)}>
            <span className="sr-only">{ui.closeCookies}</span>
            <span aria-hidden="true">×</span>
          </button>
        )}
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
    </>
  );
  if (modal)
    return (
      <dialog
        ref={dialog}
        className="modal-dialog cookie-dialog"
        aria-labelledby="cookie-title"
        aria-describedby="cookie-text"
        onCancel={() => setModal(false)}
        onClose={() => setModal(false)}
      >
        {body}
      </dialog>
    );
  if (decided || hidden) return null;
  return (
    <section
      ref={banner}
      className="cookie-card"
      role="region"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-text"
    >
      {body}
    </section>
  );
}
