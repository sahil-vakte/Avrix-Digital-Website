import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ServicesFilter } from './sections';
import Header from './layout/Header';
import { page, services, ui } from '../content';

beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  // jsdom does not implement native dialog methods.
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
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal');
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'close');
});

it('lets visitors explore each service category and return to all services', () => {
  render(<ServicesFilter rich={false} />);
  for (const filter of page('services').filters!) {
    const button = screen.getByRole('button', { name: filter.label });
    fireEvent.click(button);
    expect(button.getAttribute('aria-pressed')).toBe('true');
    const expected = services.filter((s) => filter.key === 'all' || s.pillar === filter.key);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(expected.length);
    expect(screen.getByRole('status').textContent).toBe(`${expected.length} ${ui.serviceResults}`);
    expected.forEach((s) =>
      expect(screen.getByRole('link', { name: s.title }).getAttribute('href')).toBe(
        `/services/${s.slug}/`,
      ),
    );
  }
  fireEvent.click(screen.getByRole('button', { name: ui.all }));
  expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(services.length);
});

it('opens the mobile navigation, closes it on a link, and unlocks page scrolling', () => {
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Header />
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByRole('button', { name: /Menu/ }));
  const dialog = screen.getByRole('dialog');
  expect(document.body.style.overflow).toBe('hidden');
  const about = within(dialog).getByRole('link', { name: 'About' });
  about.addEventListener('click', (event) => event.preventDefault());
  fireEvent.click(about);
  expect(dialog.hasAttribute('open')).toBe(false);
  expect(document.body.style.overflow).toBe('');
});

it('closes the desktop services menu with Escape and restores focus', () => {
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Header />
    </MemoryRouter>,
  );
  const button = screen.getByRole('button', { name: /Services/ });
  fireEvent.click(button);
  expect(button.getAttribute('aria-expanded')).toBe('true');
  fireEvent.keyDown(button, { key: 'Escape' });
  expect(button.getAttribute('aria-expanded')).toBe('false');
  expect(document.activeElement).toBe(button);
});

it('navigates the services dropdown with the keyboard and closes on an outside click', () => {
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Header />
    </MemoryRouter>,
  );
  const button = screen.getByRole('button', { name: /Services/ });
  fireEvent.click(button);
  fireEvent.keyDown(button, { key: 'ArrowDown' });
  expect(document.activeElement?.textContent).toContain('All Services');
  fireEvent.keyDown(document.activeElement!, { key: 'End' });
  expect(document.activeElement?.textContent).toContain('Book a free');
  fireEvent.pointerDown(document.body);
  expect(button.getAttribute('aria-expanded')).toBe('false');
});

it('keeps a hover-opened menu open on the first click and exposes the products menu', () => {
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Header />
    </MemoryRouter>,
  );
  const servicesButton = screen.getByRole('button', { name: /Services/ });
  fireEvent.mouseEnter(servicesButton.parentElement!);
  fireEvent.click(servicesButton);
  expect(servicesButton.getAttribute('aria-expanded')).toBe('true');
  fireEvent.click(servicesButton);
  expect(servicesButton.getAttribute('aria-expanded')).toBe('false');
  fireEvent.click(screen.getByRole('button', { name: /Products/ }));
  expect(screen.getByRole('link', { name: /Voice Call Agent/ }).getAttribute('href')).toBe(
    '/solutions/voice-call-agent/',
  );
});
