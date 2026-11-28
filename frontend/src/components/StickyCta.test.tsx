import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { StickyCta } from './sections';
import { content, nav } from '../content';

afterEach(cleanup);

it('opens a menu of pre-filled consultation routes and closes with Escape', () => {
  render(<StickyCta />);
  const toggle = screen.getByRole('button', { name: new RegExp(nav.sticky_cta.title) });
  expect(toggle.getAttribute('aria-expanded')).toBe('false');
  fireEvent.click(toggle);
  expect(toggle.getAttribute('aria-expanded')).toBe('true');
  for (const o of nav.sticky_cta.options) {
    const link = screen.getByRole('link', { name: new RegExp(o.label) });
    expect(link.getAttribute('data-enquiry-trigger')).toBe('true');
    expect(link.getAttribute('data-enquiry-topic')).toBe(o.topic);
  }
  expect(
    screen.getByRole('link', { name: nav.sticky_cta.incident.label }).getAttribute('href'),
  ).toBe(nav.sticky_cta.incident.href);
  fireEvent.keyDown(window, { key: 'Escape' });
  expect(toggle.getAttribute('aria-expanded')).toBe('false');
});

it('only offers topics that exist on the enquiry form', () => {
  const field = content.pages
    .find((p) => p.slug === 'contact-us')!
    .form!.fields.find((f) => f.name === 'services')!;
  const values = field.options!.map((o) => o.value);
  for (const o of nav.sticky_cta.options) expect(values).toContain(o.topic);
});
