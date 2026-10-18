import fs from 'node:fs';
import { afterEach, expect, it, vi } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';

afterEach(() => {
  document.body.innerHTML = '';
  vi.unstubAllGlobals();
});

it('loads an enquiry drawer, saves its status and restores focus on close', async () => {
  document.body.innerHTML = `<table><tbody><tr><td><a href="/record/" data-enquiry-panel="/panel/">View details</a></td><td class="field-status_badge"><strong>New</strong></td></tr></tbody></table><dialog id="enquiry-drawer"><button data-close-enquiry>Close</button><div id="enquiry-drawer-content"></div></dialog>`;
  const drawer = document.querySelector('dialog')!;
  Object.defineProperties(drawer, {
    showModal: { value: () => drawer.setAttribute('open', '') },
    close: {
      value: () => {
        drawer.removeAttribute('open');
        drawer.dispatchEvent(new Event('close'));
      },
    },
  });
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      text: async () =>
        '<article><p>Project message</p><form action="/panel/" data-enquiry-status-form><input name="csrfmiddlewaretoken" value="csrf"><select name="status"><option value="qualified">Qualified</option></select><button type="submit">Save status</button></form></article>',
    })
    .mockResolvedValueOnce({
      ok: true,
      text: async () => '<article data-panel-status="Qualified"><p>Status saved.</p></article>',
    });
  vi.stubGlobal('fetch', fetcher);
  const source = fs.readFileSync('../backend/enquiries/static/enquiries/admin.js', 'utf8');
  new Function(source)();
  document.dispatchEvent(new Event('DOMContentLoaded'));
  const trigger = document.querySelector<HTMLAnchorElement>('[data-enquiry-panel]')!;
  trigger.focus();
  fireEvent.click(trigger);
  await waitFor(() =>
    expect(document.getElementById('enquiry-drawer-content')!.textContent).toContain(
      'Project message',
    ),
  );
  expect(drawer.hasAttribute('open')).toBe(true);
  expect(document.body.style.overflow).toBe('hidden');
  fireEvent.submit(document.querySelector('[data-enquiry-status-form]')!);
  await waitFor(() =>
    expect(document.querySelector('.field-status_badge')!.textContent).toBe('Qualified'),
  );
  expect(fetcher.mock.calls[1][1].method).toBe('POST');
  expect(fetcher.mock.calls[1][1].body.get('status')).toBe('qualified');
  expect(fetcher.mock.calls[1][1].body.get('csrfmiddlewaretoken')).toBe('csrf');
  fireEvent.click(drawer.querySelector('button')!);
  expect(drawer.hasAttribute('open')).toBe(false);
  expect(document.body.style.overflow).toBe('');
  expect(document.activeElement).toBe(trigger);
});
