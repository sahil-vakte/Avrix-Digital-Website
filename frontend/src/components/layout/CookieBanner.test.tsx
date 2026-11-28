import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import CookieBanner from './CookieBanner';
import Accreditations from './Accreditations';
import NewsletterDialog from '../forms/NewsletterDialog';
import { accreditations, ui } from '../../content';
import { openCookiePreferences, openNewsletter } from '../../lib/overlay';

beforeEach(() => {
  Object.defineProperties(HTMLDialogElement.prototype, {
    showModal: {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.setAttribute('open', '');
      },
    },
    close: {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.removeAttribute('open');
      },
    },
  });
});
afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  document.cookie = 'avrix_consent=; Max-Age=0; Path=/';
});

it('asks for consent on a first visit, gives reject equal weight and remembers the choice', () => {
  render(<CookieBanner />);
  expect(screen.getByRole('region', { name: ui.cookieTitle })).toBeTruthy();
  expect(screen.getByRole('button', { name: ui.accept })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: ui.reject }));
  expect(screen.queryByRole('region', { name: ui.cookieTitle })).toBeNull();
  expect(decodeURIComponent(document.cookie)).toContain('"analytics":false');
});

it('lets visitors choose categories individually', () => {
  render(<CookieBanner />);
  fireEvent.click(screen.getByRole('button', { name: ui.preferences }));
  fireEvent.click(screen.getByRole('switch', { name: new RegExp(ui.analytics) }));
  fireEvent.click(screen.getByRole('button', { name: ui.save }));
  const consent = decodeURIComponent(document.cookie);
  expect(consent).toContain('"analytics":true');
  expect(consent).toContain('"advertising":false');
});

it('opens cookie preferences as a named modal from the footer and lets visitors change their mind', async () => {
  document.cookie = 'avrix_consent=' + encodeURIComponent('{"analytics":true,"advertising":false}');
  render(<CookieBanner />);
  expect(screen.queryByRole('region', { name: ui.cookieTitle })).toBeNull();
  act(openCookiePreferences);
  const dialog = await screen.findByRole('dialog', { name: ui.cookieTitle });
  const analytics = screen.getByRole('switch', { name: new RegExp(ui.analytics) });
  expect((analytics as HTMLInputElement).checked).toBe(true);
  fireEvent.click(analytics);
  fireEvent.click(screen.getByRole('button', { name: ui.save }));
  expect(decodeURIComponent(document.cookie)).toContain('"analytics":false');
  expect(dialog.isConnected).toBe(false);
});

it('closes the modal with Escape and the labelled close button', async () => {
  render(<CookieBanner />);
  act(openCookiePreferences);
  fireEvent(await screen.findByRole('dialog'), new Event('cancel', { bubbles: true }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  act(openCookiePreferences);
  fireEvent.click(await screen.findByRole('button', { name: ui.closeCookies }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
});

it('shows only one overlay at a time', async () => {
  vi.stubEnv('VITE_PUBLIC_FORMS_ENABLED', 'false');
  render(
    <>
      <CookieBanner />
      <NewsletterDialog />
    </>,
  );
  act(openNewsletter);
  expect(await screen.findByRole('dialog', { name: /email a month/i })).toBeTruthy();
  // The first-visit banner steps aside while a modal is open.
  expect(screen.queryByRole('region', { name: ui.cookieTitle })).toBeNull();
  act(openCookiePreferences);
  await screen.findByRole('dialog', { name: ui.cookieTitle });
  await waitFor(() => expect(screen.getAllByRole('dialog')).toHaveLength(1));
});

it('shows a truthful newsletter state when sign-ups are not configured', async () => {
  vi.stubEnv('VITE_PUBLIC_FORMS_ENABLED', 'false');
  render(<NewsletterDialog />);
  act(openNewsletter);
  expect(await screen.findByText('Newsletter sign-ups will be available soon.')).toBeTruthy();
  expect(screen.queryByRole('textbox')).toBeNull();
});

it('shows each accreditation logo above the footer', () => {
  render(<Accreditations />);
  for (const item of accreditations.items)
    expect(screen.getByRole('img', { name: item.name })).toBeTruthy();
});
