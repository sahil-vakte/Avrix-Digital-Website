import { lazy, Suspense } from 'react';
import { content, site, services, serviceHref, nav, ui } from '../../content';
import { track } from '../../lib/analytics';
import { apiOrigin } from '../../lib/api';
const Newsletter = lazy(() => import('../forms/Newsletter'));
const adminLoginUrl =
  import.meta.env.VITE_ADMIN_URL || `${apiOrigin}/manage-7f3k/`;
export default function Footer() {
  return (
    <footer>
      <div className="container">
        <p className="footer-wordmark">{site.tagline}</p>
        <div className="footer-grid">
          <div>
            <a className="wordmark" href="/">
              {content.hasLogo ? (
                <img
                  src={site.logo.light_on_dark}
                  alt={site.logo.alt}
                  width="372"
                  height="85"
                  loading="lazy"
                />
              ) : (
                site.brand_name.toUpperCase()
              )}
            </a>
            <p>{site.service_area}</p>
            <a href={`mailto:${site.email}`} onClick={() => track('email_click')}>
              {site.email}
            </a>
            {site.phone && (
              <a href={`tel:${site.phone}`} onClick={() => track('phone_click')}>
                {site.phone}
              </a>
            )}
            <p>{site.opening_hours}</p>
            {Object.entries(site.socials)
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <a key={k} href={v!}>
                  {k}
                </a>
              ))}
          </div>
          <div>
            <h3>{ui.services}</h3>
            {services.map((s) => (
              <a key={s.slug} href={serviceHref(s.slug)}>
                {s.title}
              </a>
            ))}
          </div>
          <div>
            <h3>{ui.company}</h3>
            {nav.footer.company.map((l) => (
              <a key={l.label} href={l.href}>
                {l.label}
              </a>
            ))}
            <h3>{ui.legal}</h3>
            {nav.footer.legal.map((l) =>
              l.action ? (
                <button
                  key={l.label}
                  onClick={() => dispatchEvent(new Event('cookie-preferences'))}
                >
                  {l.label}
                </button>
              ) : (
                <a key={l.label} href={l.href}>
                  {l.label}
                </a>
              ),
            )}
          </div>
          <Suspense>
            <Newsletter />
          </Suspense>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {site.legal_name || site.brand_name}.{' '}
            {site.company_number && `${ui.registration} ${site.company_number}. `}
            {site.registered_office && `${ui.office} ${site.registered_office}. `}
            {site.vat_number && `${ui.vat} ${site.vat_number}`}
          </span>
          <div className="footer-utilities">
            <a className="footer-admin" href={adminLoginUrl}>
              {ui.adminLogin}
            </a>
            <a className="back-top" href="#main">
              {ui.backToTop} <span aria-hidden="true">↑</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
