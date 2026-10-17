import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EnquiryExperience from './EnquiryExperience';
import { Button } from '../ui';
import { ui } from '../../content';

vi.mock('./EnquiryForm', () => ({
  default: ({ service, preferredContact }: { service?: string; preferredContact: string }) => (
    <form aria-label="Project enquiry">
      <span>{service || 'No selection'}</span>
      <span>{preferredContact}</span>
      <input aria-label="Name" />
    </form>
  ),
}));

beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: false })),
  );
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
  vi.unstubAllGlobals();
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal');
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'close');
});
const wrap = (path: string, children = <Button href="#enquiry">Discuss project</Button>) =>
  render(
    <MemoryRouter
      initialEntries={[path]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <EnquiryExperience>{children}</EnquiryExperience>
    </MemoryRouter>,
  );

it('opens only on request and preselects the solution from the current page', async () => {
  wrap('/solutions/wims/');
  expect(screen.queryByRole('dialog')).toBeNull();
  const trigger = screen.getByRole('link', { name: /Discuss project/ });
  trigger.focus();
  fireEvent.click(trigger);
  expect(await screen.findByRole('form', { name: 'Project enquiry' })).toBeTruthy();
  expect(screen.getByText('wims')).toBeTruthy();
  expect(document.body.style.overflow).toBe('hidden');
  fireEvent.click(screen.getByRole('button', { name: ui.closeEnquiry }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(document.body.style.overflow).toBe('');
  expect(document.activeElement).toBe(trigger);
});

it('uses a call preference from the sticky button and supports native Escape dismissal', async () => {
  wrap('/solutions/voice-call-agent/');
  fireEvent.click(screen.getByRole('button', { name: /Schedule a call/ }));
  await screen.findByRole('form', { name: 'Project enquiry' });
  expect(screen.getByText('voice-call-agent')).toBeTruthy();
  expect(screen.getByText('video-call')).toBeTruthy();
  fireEvent(screen.getByRole('dialog'), new Event('cancel', { bubbles: true }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(document.body.style.overflow).toBe('');
});

it('keeps Contact enquiries on the page and focuses the inline form', () => {
  const scroll = vi.fn();
  wrap(
    '/contact-us/',
    <>
      <Button href="#enquiry">Discuss project</Button>
      <form id="enquiry">
        <input aria-label="Inline name" />
      </form>
    </>,
  );
  document.getElementById('enquiry')!.scrollIntoView = scroll;
  fireEvent.click(screen.getByRole('link', { name: /Discuss project/ }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(scroll).toHaveBeenCalled();
  expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Inline name' }));
});
