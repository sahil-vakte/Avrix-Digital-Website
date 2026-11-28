import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import EnquiryForm from './EnquiryForm';
import Newsletter from './Newsletter';
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

it('shows a newsletter notice without an email field when forms are disabled', () => {
  vi.stubEnv('VITE_PUBLIC_FORMS_ENABLED', 'false');
  render(<Newsletter />);
  expect(screen.getByText('Newsletter sign-ups will be available soon.')).toBeTruthy();
  expect(screen.queryByRole('textbox')).toBeNull();
  expect(screen.queryByRole('button')).toBeNull();
});
