import './styles/tokens.css';
import './styles/globals.css';
import './styles/prose.css';
import './styles/experience.css';
import './styles/solutions.css';

// Paint the complete static page before downloading and hydrating React.
if (!import.meta.env.SSR && typeof window !== 'undefined') {
  let started = false;
  let observer: PerformanceObserver | undefined;
  const hydrate = () => {
    if (started) return;
    started = true;
    observer?.disconnect();
    void import('./main');
  };
  if (typeof PerformanceObserver !== 'undefined' && PerformanceObserver.supportedEntryTypes.includes('paint')) {
    observer = new PerformanceObserver((entries) => {
      if (entries.getEntries().some((entry) => entry.name === 'first-contentful-paint')) hydrate();
    });
    observer.observe({ type: 'paint', buffered: true });
    // Initialise even when a browser suppresses paint events (for example, a hidden tab).
    setTimeout(hydrate, 1500);
  } else {
    requestAnimationFrame(() => requestAnimationFrame(hydrate));
  }
}

// vite-react-ssg calls this export when prerendering the site on the server.
export async function createRoot(...args: Parameters<typeof import('./main')['createRoot']>) {
  return (await import('./main')).createRoot(...args);
}
