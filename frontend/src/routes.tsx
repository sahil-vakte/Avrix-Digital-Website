import { lazy, Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import type { RouteRecord as SSGRoute } from 'vite-react-ssg';
import { content, page, ui } from './content';
import { buildRoutes, type RouteRecord } from './content/routes';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CookieBanner from './components/layout/CookieBanner';
import EnquiryExperience from './components/forms/EnquiryExperience';
import Seo from './components/seo/Seo';
import { CtaBand } from './components/sections';
const Home = lazy(() => import('./pages/Home'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));
const ContentPages = lazy(() => import('./pages/ContentPages'));
const Solutions = lazy(() => import('./pages/Solutions'));
import { captureAttribution } from './lib/utm';
import { initConsent } from './lib/analytics';
const Enhance = lazy(() => import('./components/motion/Enhance'));
function Layout() {
  const location = useLocation();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    initConsent();
    try {
      captureAttribution(sessionStorage, window.location.href, document.referrer);
    } catch {
      /* storage disabled */
    }
    document.documentElement.classList.add('js-ready');
    const enhance = () => setReady(true);
    addEventListener('scroll', enhance, { once: true, passive: true });
    return () => removeEventListener('scroll', enhance);
  }, []);
  return (
    <EnquiryExperience>
      <a className="skip-link" href="#main">
        {ui.skip}
      </a>
      <Header />
      <main id="main" key={location.pathname}>
        <Outlet />
      </main>
      <Footer />
      <CookieBanner />
      {ready && (
        <Suspense>
          <Enhance />
        </Suspense>
      )}
    </EnquiryExperience>
  );
}
function RoutePage({ route }: { route: RouteRecord }) {
  return (
    <>
      <Seo route={route} />
      <Suspense
        fallback={
          <div className="page-loading" role="status">
            {ui.serviceLoading}
          </div>
        }
      >
        {route.kind === 'home' ? (
          <Home />
        ) : route.kind === 'service' ? (
          <ServiceDetail slug={route.slug!} />
        ) : route.kind === 'solution' || route.kind === 'solutions' ? (
          <Solutions route={route} />
        ) : (
          <ContentPages route={route} />
        )}
      </Suspense>
      {route.kind !== 'home' &&
        route.kind !== 'contact' &&
        !(route.slug && content.pages.some((p) => p.slug === route.slug && p.hide_cta_band)) && (
          <CtaBand />
        )}
    </>
  );
}
export const records = buildRoutes(content);
export const routes: SSGRoute[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      ...records.map((route) => ({
        index: route.path === '/' ? true : undefined,
        path: route.path === '/' ? undefined : route.path.slice(1),
        element: <RoutePage route={route} />,
      })),
      {
        path: '*',
        element: (
          <RoutePage route={{ ...page('404'), kind: '404', path: '/404/', noindex: true }} />
        ),
      },
    ],
  },
];
