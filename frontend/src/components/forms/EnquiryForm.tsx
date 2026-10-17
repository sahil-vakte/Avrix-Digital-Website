import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { page, site, ui } from '../../content';
import type { EnquiryInput } from '../../lib/form';
import { post, ApiError } from '../../lib/api';
import { currentAttribution } from '../../lib/utm';
import { lead } from '../../lib/analytics';
import { Button } from '../ui';
import Turnstile from './Turnstile';
export default function EnquiryForm({
  service,
  preferredContact = 'email',
}: {
  service?: string;
  preferredContact?: EnquiryInput['preferred_contact'];
}) {
  const copy = page('contact-us').form!;
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const started = useRef(Date.now());
  const [token, setToken] = useState('');
  const onToken = useCallback((v: string) => setToken(v), []);
  const [reset, setReset] = useState(0);
  const [success, setSuccess] = useState(false);
  const [failed, setFailed] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryInput>({
    resolver: async (values, context, options) => {
      const [{ enquirySchema }, { zodResolver }] = await Promise.all([
        import('../../lib/form'),
        import('@hookform/resolvers/zod'),
      ]);
      return zodResolver(enquirySchema)(values, context, options);
    },
    defaultValues: {
      services: service ? [service as EnquiryInput['services'][number]] : [],
      preferred_contact: preferredContact,
      privacy_ack: false,
      marketing_opt_in: false,
    },
  });
  const submit = handleSubmit(async (values) => {
    setFailed(false);
    if (!token) {
      setFailed(true);
      return;
    }
    try {
      const result = await post<{ id: string }>('enquiries', {
        ...values,
        turnstile_token: token,
        elapsed_ms: Date.now() - started.current,
        source_page: location.pathname,
        attribution: currentAttribution(),
      });
      setSuccess(true);
      lead(result.id, { service: values.services.join(','), budget: values.budget });
      try {
        sessionStorage.setItem('last_enquiry', result.id);
      } catch {
        /* optional */
      }
    } catch (error) {
      setFailed(true);
      if (error instanceof ApiError) {
        Object.entries(error.fields).forEach(([key, messages]) => {
          if (copy.fields.some((field) => field.name === key))
            setError(key as keyof EnquiryInput, { message: messages.join(' ') });
        });
      }
    } finally {
      setToken('');
      setReset((v) => v + 1);
    }
  });
  if (success)
    return (
      <div className="form-success" role="status">
        <span className="success-tick" aria-hidden="true">
          ✓
        </span>
        <h2>{copy.success_title}</h2>
        <p>{copy.success_text}</p>
        <Button href="booking_url_or:/contact-us/">{site.booking_label}</Button>
      </div>
    );
  return (
    <form id="enquiry" className="enquiry-form" onSubmit={submit} noValidate>
      <h2>{copy.title}</h2>
      <div className="form-grid">
        {copy.fields.map((f) => {
          const name = f.name as keyof EnquiryInput;
          const error = errors[name]?.message;
          const shared = {
            ...register(name),
            id: `enquiry-${name}`,
            'aria-invalid': !!error,
            'aria-describedby': error ? `${name}-error` : undefined,
          };
          return (
            <div
              className={`field ${['textarea', 'multiselect-chips', 'checkbox', 'radio'].includes(f.type) ? 'full' : ''}`}
              key={name}
            >
              {f.type === 'checkbox' ? (
                <label className="check">
                  <input type="checkbox" {...shared} />
                  <span>{f.label}</span>
                </label>
              ) : f.options && ['multiselect-chips', 'radio'].includes(f.type) ? (
                <fieldset aria-describedby={error ? `${name}-error` : undefined}>
                  <legend>{f.label}</legend>
                  <div className="choices">
                    {f.options.map((o) => (
                      <label key={o.value}>
                        <input
                          {...register(name)}
                          type={f.type === 'radio' ? 'radio' : 'checkbox'}
                          value={o.value}
                        />
                        <span>{o.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ) : (
                <>
                  <label htmlFor={shared.id}>
                    {f.label}
                    {f.required ? ' *' : ''}
                  </label>
                  {f.type === 'textarea' ? (
                    <textarea {...shared} rows={5} maxLength={5000} placeholder={f.placeholder} />
                  ) : f.type === 'select' ? (
                    <select {...shared}>
                      <option value="">{ui.choose}</option>
                      {f.options?.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input {...shared} type={f.type} autoComplete={f.autocomplete} />
                  )}
                </>
              )}
              {error && (
                <p className="field-error" id={`${name}-error`}>
                  {error}
                </p>
              )}
            </div>
          );
        })}
      </div>
      <div className="honeypot" aria-hidden="true">
        <label>
          Company website
          <input {...register('company_website_hp')} tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <a href="/privacy-policy/">{ui.legal}</a>
      <Turnstile onToken={onToken} resetKey={reset} />
      <noscript>
        <p>
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </p>
      </noscript>
      <button className="button primary" disabled={!hydrated || isSubmitting} type="submit">
        {isSubmitting ? ui.sending : copy.submit_label} <span aria-hidden="true">↗</span>
      </button>
      <div aria-live="polite">
        {failed && (
          <p className="field-error">
            {!token && ui.turnstile} {copy.error_text}{' '}
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </p>
        )}
      </div>
    </form>
  );
}
