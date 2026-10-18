document.addEventListener('DOMContentLoaded', () => {
  const drawer = document.getElementById('enquiry-drawer');
  const content = document.getElementById('enquiry-drawer-content');
  let currentRequest;
  let trigger;
  let previousOverflow = '';
  let activeUrl;
  const error = (message) => {
    const paragraph = document.createElement('p');
    paragraph.className = 'enquiry-panel-error';
    paragraph.setAttribute('role', 'alert');
    paragraph.textContent = message;
    content.replaceChildren(paragraph);
  };
  if (drawer && content) {
    document.addEventListener('click', async (event) => {
      const link = event.target.closest('a[data-enquiry-panel], .field-full_name a');
      if (
        !link ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0
      )
        return;
      const endpoint =
        link.dataset.enquiryPanel ||
        link.closest('tr')?.querySelector('[data-enquiry-panel]')?.dataset.enquiryPanel;
      if (!endpoint) return;
      event.preventDefault();
      currentRequest?.abort();
      currentRequest = new AbortController();
      const controller = currentRequest;
      trigger = link;
      activeUrl = endpoint;
      content.textContent = 'Loading enquiry details...';
      if (!drawer.open) {
        previousOverflow = document.body.style.overflow;
        drawer.showModal();
        document.body.style.overflow = 'hidden';
      }
      try {
        const response = await fetch(endpoint, {
          credentials: 'same-origin',
          signal: controller.signal,
        });
        if (response.redirected) {
          window.location.assign(response.url);
          return;
        }
        if (!response.ok)
          throw new Error('Could not load this enquiry. Check your permissions and try again.');
        const html = await response.text();
        if (!controller.signal.aborted) content.innerHTML = html;
      } catch (cause) {
        if (!controller.signal.aborted) error(cause.message || 'Could not load enquiry details.');
      }
    });
    drawer.querySelector('[data-close-enquiry]')?.addEventListener('click', () => drawer.close());
    drawer.addEventListener('close', () => {
      currentRequest?.abort();
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    });
    drawer.addEventListener('submit', async (event) => {
      const form = event.target.closest('[data-enquiry-status-form]');
      if (!form) return;
      event.preventDefault();
      const submit = form.querySelector('button[type="submit"]');
      submit.disabled = true;
      currentRequest?.abort();
      currentRequest = new AbortController();
      const controller = currentRequest;
      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          credentials: 'same-origin',
          signal: controller.signal,
        });
        if (response.redirected) {
          window.location.assign(response.url);
          return;
        }
        if (!response.ok && response.status !== 400)
          throw new Error('Could not save the status. Check your permissions and try again.');
        const html = await response.text();
        if (controller.signal.aborted) return;
        content.innerHTML = html;
        if (response.ok) {
          const status = content.querySelector('[data-panel-status]')?.dataset.panelStatus;
          document.querySelectorAll('[data-enquiry-panel]').forEach((link) => {
            if (link.dataset.enquiryPanel === activeUrl) {
              const cell = link
                .closest('tr')
                ?.querySelector('.field-status_badge strong, [data-enquiry-status]');
              if (cell) cell.textContent = status;
            }
          });
        }
      } catch (cause) {
        if (controller.signal.aborted) return;
        const paragraph = document.createElement('p');
        paragraph.className = 'enquiry-panel-error';
        paragraph.setAttribute('role', 'alert');
        paragraph.textContent = cause.message || 'Could not save the status.';
        form.append(paragraph);
        submit.disabled = false;
      }
    });
  }
  const button = document.querySelector('[data-copy-enquiry]');
  button?.addEventListener('click', async () => {
    const status = document.getElementById('copy-status');
    try {
      await navigator.clipboard.writeText(document.getElementById('enquiry-copy').textContent);
      status.textContent = 'Details copied.';
    } catch {
      status.textContent = 'Copy unavailable. Select and copy the submitted fields.';
    }
  });
});
