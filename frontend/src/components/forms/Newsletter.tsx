import { useCallback, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { page, site, ui } from '../../content';
import { ApiError, post } from '../../lib/api';
import { track } from '../../lib/analytics';
import Turnstile from './Turnstile';

type Field = 'name' | 'email' | 'consent';
type Errors = Partial<Record<Field, string>>;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Validate the sign-up fields in the browser before anything is sent. */
export function validateNewsletter(values: { name: string; email: string; consent: boolean }) {
  const errors: Errors = {};
  const name = values.name.trim();
  if (name.length < 2 || !/\p{L}/u.test(name) || /https?:\/\/|www\.|[<>{}]/i.test(name))
    errors.name = ui.newsletterNameError;
  if (!EMAIL.test(values.email.trim()) || values.email.length > 254)
    errors.email = ui.newsletterEmailError;
  if (!values.consent) errors.consent = ui.newsletterConsentError;
  return errors;
}

/** Name and email sign-up for the monthly email, with double opt-in on the server. */
export default function Newsletter() {
  const copy = page('blog').newsletter!;
  const enabled = import.meta.env.VITE_PUBLIC_FORMS_ENABLED !== 'false';
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState('');
  const [done, setDone] = useState(false);
  const [token, setToken] = useState('');
  const [active, setActive] = useState(false);
  const [sending, setSending] = useState(false);
  const start = useRef(Date.now());
  const onToken = useCallback((v: string) => setToken(v), []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!enabled) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const values = {
      name: String(data.get('name') || ''),
      email: String(data.get('email') || ''),
      consent: data.get('consent') === 'on',
    };
    const found = validateNewsletter(values);
    setErrors(found);
    if (Object.keys(found).length) {
      form.querySelector<HTMLElement>(`[name="${Object.keys(found)[0]}"]`)?.focus();
      return;
    }
    if (!token && import.meta.env.VITE_TURNSTILE_SITE_KEY) {
      setState(ui.turnstile);
      return;
    }
    setSending(true);
    setState(ui.sending);
    try {
      await post('newsletter', {
        name: values.name.trim(),
        email: values.email.trim(),
        consent_text: copy.consent,
        privacy_ack: true,
        source_page: location.pathname,
        turnstile_token: token,
        elapsed_ms: Date.now() - start.current,
        company_website_hp: data.get('company_website_hp'),
      });
      setState(ui.newsletterSuccess);
      setDone(true);
      track('newsletter_signup');
      form.reset();
    } catch (err) {
      const fields = err instanceof ApiError ? err.fields : {};
      setErrors({
        name: fields.name ? ui.newsletterNameError : undefined,
        email: fields.email ? ui.newsletterEmailError : undefined,
      });
      setState(ui.newsletterError);
    } finally {
      setSending(false);
    }
  }

  const describe = (f: Field) => (errors[f] ? `nl-${f}-error` : undefined);
  return (
    <form
      className={`newsletter-form${enabled ? '' : ' is-closed'}`}
      noValidate
      onFocus={() => setActive(true)}
      onSubmit={submit}
      aria-describedby={enabled ? undefined : 'nl-closed'}
    >
      <div className="newsletter-fields">
        <div className={`nl-field${errors.name ? ' has-error' : ''}`}>
          <label htmlFor="nl-name">{ui.newsletterName}</label>
          <input
            id="nl-name"
            name="name"
            type="text"
            autoComplete="name"
            maxLength={120}
            required
            disabled={!enabled}
            aria-invalid={!!errors.name}
            aria-describedby={describe('name')}
          />
          {errors.name && (
            <span className="nl-error" id="nl-name-error">
              {errors.name}
            </span>
          )}
        </div>
        <div className={`nl-field${errors.email ? ' has-error' : ''}`}>
          <label htmlFor="nl-email">{ui.emailAddress}</label>
          <input
            id="nl-email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
            disabled={!enabled}
            aria-invalid={!!errors.email}
            aria-describedby={describe('email')}
          />
          {errors.email && (
            <span className="nl-error" id="nl-email-error">
              {errors.email}
            </span>
          )}
        </div>
        <button type="submit" className="button primary" disabled={!enabled || sending || done}>
          {ui.newsletterSubmit} <span aria-hidden="true">→</span>
        </button>
      </div>
      <div className="honeypot" aria-hidden="true">
        <input
          name="company_website_hp"
          tabIndex={-1}
          autoComplete="off"
          aria-label="Company website"
        />
      </div>
      <label className={`nl-consent${errors.consent ? ' has-error' : ''}`}>
        <input
          type="checkbox"
          name="consent"
          disabled={!enabled}
          aria-invalid={!!errors.consent}
          aria-describedby={describe('consent')}
        />
        <span>
          {copy.consent.replace(/\s*See our privacy policy\.?$/, '')}{' '}
          <a href="/privacy-policy/">{ui.privacyPolicy}</a>.
        </span>
      </label>
      {errors.consent && (
        <span className="nl-error" id="nl-consent-error">
          {errors.consent}
        </span>
      )}
      {enabled && active && <Turnstile onToken={onToken} />}
      {enabled ? (
        <p className={`nl-status${done ? ' is-done' : ''}`} role="status" aria-live="polite">
          {state}
        </p>
      ) : (
        <p className="nl-status" id="nl-closed" role="status">
          {ui.newsletterClosedNote} <a href={`mailto:${site.email}`}>{site.email}</a>
        </p>
      )}
    </form>
  );
}
