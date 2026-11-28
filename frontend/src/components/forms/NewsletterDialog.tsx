import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { page, ui } from '../../content';
import { announceClosed, announceOpen, closeWhenOtherOpens } from '../../lib/overlay';
const Newsletter = lazy(() => import('./Newsletter'));

/** Standalone newsletter popup, opened by "Join the newsletter" buttons. */
export default function NewsletterDialog() {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const show = () => {
      opener.current = document.activeElement as HTMLElement;
      setOpen(true);
    };
    addEventListener('open-newsletter', show);
    const off = closeWhenOtherOpens('newsletter', () => setOpen(false));
    return () => {
      removeEventListener('open-newsletter', show);
      off();
    };
  }, []);
  useEffect(() => {
    if (!open) return;
    const el = dialog.current;
    announceOpen('newsletter');
    el?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      el?.close();
      document.body.style.overflow = overflow;
      announceClosed('newsletter');
      if (opener.current?.isConnected) opener.current.focus();
    };
  }, [open]);
  if (!open) return null;
  const copy = page('blog').newsletter!;
  return (
    <dialog
      ref={dialog}
      className="modal-dialog newsletter-dialog"
      aria-labelledby="newsletter-title"
      onCancel={() => setOpen(false)}
      onClose={() => setOpen(false)}
    >
      <div className="modal-head">
        <p className="eyebrow">{ui.newsletter}</p>
        <button type="button" className="modal-close" onClick={() => setOpen(false)}>
          <span className="sr-only">{ui.closeNewsletter}</span>
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <h2 id="newsletter-title">{copy.title}</h2>
      <Suspense fallback={<p role="status">{ui.serviceLoading}</p>}>
        <Newsletter />
      </Suspense>
    </dialog>
  );
}
