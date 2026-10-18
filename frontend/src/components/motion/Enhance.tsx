import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Native, one-off reveals. Content stays visible without JS or motion support. */
export default function Enhance() {
  const { pathname } = useLocation();
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    if (preference.matches) return;
    const animations = new Set<Animation>();
    const seen = new WeakSet<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          const animation = entry.target.animate(
            [
              { opacity: 0.35, transform: 'translateY(18px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
            { duration: 550, easing: 'cubic-bezier(.22,1,.36,1)' },
          );
          animations.add(animation);
          animation.onfinish = () => animations.delete(animation);
        });
      },
      { threshold: 0.08 },
    );
    const observe = () => {
      document.querySelectorAll('[data-reveal], .stagger > *').forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        observer.observe(el);
      });
    };
    observe();
    const mutations = new MutationObserver(observe);
    const main = document.getElementById('main');
    if (main) mutations.observe(main, { childList: true, subtree: true });
    const stop = () => {
      if (!preference.matches) return;
      observer.disconnect();
      mutations.disconnect();
      animations.forEach((animation) => animation.cancel());
    };
    preference.addEventListener('change', stop);
    return () => {
      observer.disconnect();
      mutations.disconnect();
      animations.forEach((animation) => animation.cancel());
      preference.removeEventListener('change', stop);
    };
  }, [pathname]);
  return null;
}
