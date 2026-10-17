import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { content, page, services, site, solutions, ui } from '../../content';
const EnquiryForm = lazy(() => import('./EnquiryForm'));

export default function EnquiryExperience({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [request, setRequest] = useState<{ service?: string; call: boolean } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  useEffect(() => {
    setRequest(null);
  }, [pathname]);
  useEffect(() => {
    if (!request) return;
    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
      if (opener.current?.isConnected) {
        const closedSheet = opener.current.closest('dialog:not([open])');
        if (closedSheet) document.querySelector<HTMLButtonElement>('.menu-toggle')?.focus();
        else opener.current.focus();
      }
    };
  }, [request]);
  function open(trigger: HTMLElement, call = false) {
    if (pathname === '/contact-us/') {
      const form = document.getElementById('enquiry');
      form?.scrollIntoView({
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      });
      form
        ?.querySelector<HTMLInputElement>('input:not([type="hidden"])')
        ?.focus({ preventScroll: true });
      return;
    }
    opener.current = trigger;
    const candidate = pathname.match(/^\/(?:services|solutions)\/([^/]+)\/?$/)?.[1];
    const service = [...services, ...solutions].some((item) => item.slug === candidate)
      ? candidate
      : undefined;
    setRequest({ service, call });
  }
  function intercept(event: MouseEvent<HTMLDivElement>) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>(
      'a[data-enquiry-trigger="true"], a[href="#enquiry"]',
    );
    if (!anchor || dialog.current?.contains(anchor)) return;
    event.preventDefault();
    open(anchor, anchor.dataset.enquiryMode === 'call');
  }
  return (
    <div className="app-shell" onClickCapture={intercept}>
      {children}
      <div className="schedule-tab">
        {site.booking_url ? (
          <a href={site.booking_url}>
            <span aria-hidden="true">↗</span>
            {ui.scheduleCall}
          </a>
        ) : (
          <button type="button" onClick={(event) => open(event.currentTarget, true)}>
            <span aria-hidden="true">↗</span>
            {ui.scheduleCall}
          </button>
        )}
      </div>
      {request && (
        <dialog
          ref={dialog}
          className="enquiry-dialog"
          aria-label={page('contact-us').form!.title}
          onCancel={() => setRequest(null)}
          onClose={() => setRequest(null)}
        >
          <div className="enquiry-dialog-toolbar">
            <span className="enquiry-brand">
              {content.hasLogo ? (
                <img src={site.logo.light_on_dark} alt={site.logo.alt} width="372" height="85" />
              ) : (
                site.brand_name
              )}
            </span>
            <button type="button" onClick={() => setRequest(null)} aria-label={ui.closeEnquiry}>
              {ui.close} <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className="enquiry-dialog-body">
            <Suspense fallback={<p role="status">{ui.serviceLoading}</p>}>
              <EnquiryForm
                service={request.service}
                preferredContact={request.call ? 'video-call' : 'email'}
              />
            </Suspense>
          </div>
        </dialog>
      )}
    </div>
  );
}
