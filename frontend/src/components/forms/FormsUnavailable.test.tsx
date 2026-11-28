import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import EnquiryForm from './EnquiryForm';
import Newsletter, { validateNewsletter } from './Newsletter';
import { site, ui } from '../../content';

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

it('shows an enquiry notice without collecting personal details when forms are disabled', () => {
  vi.stubEnv('VITE_PUBLIC_FORMS_ENABLED', 'false');
  render(<EnquiryForm />);
  expect(screen.getByText(ui.formsUnavailable)).toBeTruthy();
  expect(screen.getByRole('link', { name: new RegExp(site.email) }).getAttribute('href')).toBe(
    `mailto:${site.email}`,
  );
  expect(screen.queryByRole('textbox')).toBeNull();
  expect(screen.queryByRole('button')).toBeNull();
});

it('shows the newsletter form switched off, with an email fallback, when forms are disabled', () => {
  vi.stubEnv('VITE_PUBLIC_FORMS_ENABLED', 'false');
  render(<Newsletter />);
  expect(screen.getByText(new RegExp(ui.newsletterClosedNote.slice(0, 20)))).toBeTruthy();
  for (const box of screen.getAllByRole('textbox'))
    expect((box as HTMLInputElement).disabled).toBe(true);
  expect((screen.getByRole('button', { name: /subscribe/i }) as HTMLButtonElement).disabled).toBe(
    true,
  );
  expect(screen.getByRole('link', { name: site.email }).getAttribute('href')).toBe(
    `mailto:${site.email}`,
  );
});

it('validates name, email and consent before sending anything', async () => {
  vi.stubEnv('VITE_PUBLIC_FORMS_ENABLED', 'true');
  const fetchSpy = vi.spyOn(globalThis, 'fetch');
  render(<Newsletter />);
  fireEvent.change(screen.getByLabelText(ui.newsletterName), { target: { value: '1' } });
  fireEvent.change(screen.getByLabelText(ui.emailAddress), { target: { value: 'not-an-email' } });
  fireEvent.click(screen.getByRole('button', { name: /subscribe/i }));
  expect(await screen.findByText(ui.newsletterNameError)).toBeTruthy();
  expect(screen.getByText(ui.newsletterEmailError)).toBeTruthy();
  expect(screen.getByText(ui.newsletterConsentError)).toBeTruthy();
  expect(screen.getByLabelText(ui.newsletterName).getAttribute('aria-invalid')).toBe('true');
  expect(fetchSpy).not.toHaveBeenCalled();
  fetchSpy.mockRestore();
});

it('accepts a real name and email', () => {
  expect(
    validateNewsletter({ name: "Siân O'Neill", email: 'sian@example.co.uk', consent: true }),
  ).toEqual({});
  expect(
    validateNewsletter({ name: 'www.spam.com', email: 'a@b.co', consent: true }).name,
  ).toBeTruthy();
});
