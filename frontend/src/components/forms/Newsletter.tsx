import { useCallback, useRef, useState } from 'react';
import { page, site, ui } from '../../content';
import { post } from '../../lib/api';
import { track } from '../../lib/analytics';
import Turnstile from './Turnstile';
export default function Newsletter() {
  const copy = page('blog').newsletter!;
  const [state, setState] = useState('');
  const [token, setToken] = useState('');
  const [active, setActive] = useState(false);
  const [sending, setSending] = useState(false);
  const start = useRef(Date.now());
  const onToken = useCallback((v: string) => setToken(v), []);
  if (import.meta.env.VITE_PUBLIC_FORMS_ENABLED === 'false')
    return (
      <div className="newsletter" role="status">
        <p>Newsletter sign-ups will be available soon.</p>
        <p>{ui.newsletterUnavailableText}</p>
      </div>
    );
  return (
    <form
      className="newsletter"
      onFocus={() => setActive(true)}
      onSubmit={async (e) => {
        e.preventDefault();
        if (!token) {
          setState(ui.turnstile);
          return;
        }
        const form = e.currentTarget;
        const data = new FormData(form);
        setSending(true);
        setState(ui.sending);
        try {
          await post('newsletter', {
            email: data.get('email'),
            consent_text: copy.consent,
            privacy_ack: true,
            source_page: location.pathname,
            turnstile_token: token,
            elapsed_ms: Date.now() - start.current,
            company_website_hp: data.get('company_website_hp'),
          });
          setState(ui.newsletterSuccess);
          track('newsletter_signup');
          form.reset();
        } catch {
          setState(ui.newsletterError);
        } finally {
          setSending(false);
        }
      }}
    >
      <p>{copy.text}</p>
      <label>
        {ui.emailAddress}
        <input type="email" name="email" required autoComplete="email" />
      </label>
      <div className="honeypot" aria-hidden="true">
        <input
          name="company_website_hp"
          tabIndex={-1}
          autoComplete="off"
          aria-label="Company website"
        />
      </div>
      <label className="check">
        <input type="checkbox" required />
        {copy.consent}
      </label>
      <p className="form-note">
        <a href="/privacy-policy/">{ui.privacyPolicy}</a>
      </p>
      {active && <Turnstile onToken={onToken} />}
      <button type="submit" disabled={!active || sending} className="button primary">
        {ui.newsletterSubmit} →
      </button>
      <p role="status" aria-live="polite">
        {state}
      </p>
      <noscript>
        <a href={`mailto:${site.email}`}>{site.email}</a>
      </noscript>
    </form>
  );
}
