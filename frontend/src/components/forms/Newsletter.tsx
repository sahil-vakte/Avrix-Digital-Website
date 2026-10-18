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
  const start = useRef(Date.now());
  const onToken = useCallback((v: string) => setToken(v), []);
  if (import.meta.env.VITE_PUBLIC_FORMS_ENABLED === 'false')
    return (
      <div className="newsletter">
        <h3>{copy.title}</h3>
        <p>Newsletter sign-ups will be available soon.</p>
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
        }
      }}
    >
      <h3>{copy.title}</h3>
      <p>{copy.text}</p>
      <label>
        Email
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
      <a href="/privacy-policy/">{ui.legal}</a>
      {active && <Turnstile onToken={onToken} />}
      <button type="submit" disabled={!active} className="button secondary">
        {ui.newsletterSubmit} ↗
      </button>
      <p role="status">{state}</p>
      <noscript>
        <a href={`mailto:${site.email}`}>{site.email}</a>
      </noscript>
    </form>
  );
}
