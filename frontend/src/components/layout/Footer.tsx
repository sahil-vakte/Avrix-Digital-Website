import { lazy, Suspense } from 'react';
import { content, site, nav, ui } from '../../content';
import { track } from '../../lib/analytics';
import { apiOrigin } from '../../lib/api';
import { Brand } from './Header';
const Newsletter = lazy(() => import('../forms/Newsletter'));
const adminLoginUrl = import.meta.env.VITE_ADMIN_URL || `${apiOrigin}/manage-7f3k/`;
export default function Footer() {
  const socials = Object.entries(site.socials).filter(([, v]) => v);
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Brand />
            <p>{nav.footer.tagline}</p>
            <ul className="footer-contact">
              <li>
                <span>{ui.emailUs}</span>
                <a href={`mailto:${site.email}`} onClick={() => track('email_click')}>
                  {site.email}
                </a>
              </li>
              {site.phone && (
                <li>
                  <span>Phone</span>
                  <a href={`tel:${site.phone}`} onClick={() => track('phone_click')}>
                    {site.phone}
                  </a>
                </li>
              )}
              <li>
                <span>{ui.hours}</span>
                {site.opening_hours}
              </li>
              <li>
                <span>{ui.coverage}</span>
                {site.service_area}
              </li>
            </ul>
            {!!socials.length && (
              <div className="footer-socials" aria-label={ui.follow}>
                {socials.map(([k, v]) => (
                  <a key={k} href={v!} rel="noopener">
                    {k}
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="footer-newsletter">
            <Suspense>
              <Newsletter />
            </Suspense>
          </div>
        </div>
        <div className="footer-grid">
          <div>
            <h3>{ui.explore}</h3>
            {nav.footer.explore.map((l) => (
              <a key={l.label} href={l.href}>
                {l.label}
              </a>
            ))}
          </div>
          <div>
            <h3>{ui.services}</h3>
            {nav.mega_menu.map((g) => (
              <a key={g.pillar} href={`/services/#${g.pillar}`}>
                {g.label}
              </a>
            ))}
            <a href="/services/incident-response/">{ui.emergencyCta}</a>
          </div>
          <div>
            <h3>{ui.industries}</h3>
            {content.industries.map((i) => (
              <a key={i.slug} href={`/industries/${i.slug}/`}>
                {i.title}
              </a>
            ))}
          </div>
          <div>
            {content.solutions.length > 0 && (
              <>
                <h3>{ui.solutions}</h3>
                {content.solutions.map((s) => (
                  <a key={s.slug} href={`/solutions/${s.slug}/`}>
                    {s.title}
                  </a>
                ))}
              </>
            )}
            <h3>{ui.legal}</h3>
            {nav.footer.legal.map((l) =>
              l.action ? (
                <button
                  key={l.label}
                  type="button"
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
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {site.legal_name || site.brand_name}. All rights reserved.{' '}
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
