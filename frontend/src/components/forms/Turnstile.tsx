import { useEffect, useRef } from 'react';
import { ui } from '../../content';
declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, options: Record<string, unknown>) => string;
      remove: (id: string) => void;
    };
  }
}
export default function Turnstile({
  onToken,
  resetKey = 0,
}: {
  onToken: (token: string) => void;
  resetKey?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const key = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
    if (!key) return;
    let id: string | undefined;
    let disposed = false;
    const render = () => {
      if (!disposed && ref.current && window.turnstile)
        id = window.turnstile.render(ref.current, {
          sitekey: key,
          callback: onToken,
          'expired-callback': () => onToken(''),
          'error-callback': () => onToken(''),
          theme: 'light',
        });
    };
    let script = document.querySelector<HTMLScriptElement>('script[data-turnstile]');
    if (window.turnstile) render();
    else {
      if (!script) {
        script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.dataset.turnstile = 'true';
        script.async = true;
        document.head.append(script);
      }
      script.addEventListener('load', render);
    }
    return () => {
      disposed = true;
      script?.removeEventListener('load', render);
      if (id) window.turnstile?.remove(id);
    };
  }, [onToken, resetKey]);
  return <div ref={ref} aria-label={ui.turnstile} />;
}
