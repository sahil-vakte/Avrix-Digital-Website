import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import CookieBanner from './CookieBanner';
import Accreditations from './Accreditations';
import { accreditations, ui } from '../../content';

afterEach(() => {
  cleanup();
  document.cookie = 'avrix_consent=; Max-Age=0; Path=/';
});

it('asks for consent first, gives reject equal weight and remembers the choice', () => {
  render(<CookieBanner />);
  expect(screen.getByRole('dialog', { name: ui.cookieTitle })).toBeTruthy();
  expect(screen.getByRole('button', { name: ui.accept })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: ui.reject }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(decodeURIComponent(document.cookie)).toContain('"analytics":false');
  fireEvent.click(screen.getByRole('button', { name: ui.cookieSettings }));
  expect(screen.getByRole('switch', { name: new RegExp(ui.analytics) })).toBeTruthy();
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

it('shows each accreditation logo above the footer', () => {
  render(<Accreditations />);
  for (const item of accreditations.items)
    expect(screen.getByRole('img', { name: item.name })).toBeTruthy();
});
