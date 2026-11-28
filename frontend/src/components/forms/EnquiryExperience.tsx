import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { content, page, services, site, solutions, ui } from '../../content';
import { announceClosed, announceOpen, closeWhenOtherOpens } from '../../lib/overlay';
const EnquiryForm = lazy(() => import('./EnquiryForm'));

/** Map a service page to the matching "What can we help with?" option on the enquiry form. */
/** Enquiry topic for pages under the four pillars. */
export function pillarTopic(pathname: string) {
  const [, pillar, page] = pathname.match(/^\/([a-z-]+)\/([a-z0-9-]*)\/?$/) || [];
  if (pillar === 'ai-solutions')
    return page === 'ai-voice-agents' ? 'voice-call-agent' : 'ai-automation';
  if (pillar === 'professional-services') return 'talent-acquisition';
  if (pillar === 'digital-transformation')
    return page === 'web-mobile-app-development' || page === 'ux-product-design'
      ? 'web-development'
      : page === 'cloud-modernisation'
        ? 'aws-consulting'
        : 'web-application-development';
  if (pillar === 'cyber-security')
    return (
      {
        'test-and-find': 'penetration-testing',
        'watch-and-detect': 'managed-soc',
        'prove-and-comply': 'security-compliance',
        'respond-and-recover': 'incident-response',
      }[page] || undefined
    );
  return undefined;
}
export function enquiryTopic(slug: string, pillar: string) {
  if (slug === 'security-awareness-training') return 'security-training';
  return (
    {
      offensive: 'penetration-testing',
      managed: 'managed-soc',
      compliance: 'security-compliance',
      response: 'incident-response',
    }[pillar] || 'not-sure'
  );
}

export default function EnquiryExperience({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [request, setRequest] = useState<{ service?: string; call: boolean } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  useEffect(() => {
    setRequest(null);
  }, [pathname]);
  useEffect(() => closeWhenOtherOpens('enquiry', () => setRequest(null)), []);
  useEffect(() => {
    if (!request) return;
    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    announceOpen('enquiry');
    element?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      element?.close();
      announceClosed('enquiry');
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
    const [, section, candidate] = pathname.match(/^\/(services|solutions)\/([^/]+)\/?$/) || [];
    const match = services.find((item) => item.slug === candidate);
    const service =
      section === 'solutions' && solutions.some((item) => item.slug === candidate)
        ? 'security-products'
        : match
          ? enquiryTopic(match.slug, match.pillar)
          : pillarTopic(pathname);
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
                <img src={site.logo.dark_on_light} alt={site.logo.alt} width="720" height="141" />
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
