import { lazy, Suspense } from 'react';
import { content, industries, industryHref, site, services, serviceHref, nav, ui } from '../../content';
import { Linkedin, Mail, Phone, Globe } from 'lucide-react';
import { track } from '../../lib/analytics';
import { apiOrigin } from '../../lib/api';
const Newsletter = lazy(() => import('../forms/Newsletter'));
const adminLoginUrl =
  import.meta.env.VITE_ADMIN_URL || `${apiOrigin}/manage-7f3k/`;
export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
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
            <p>{nav.footer.tagline || site.tagline}</p>
            <p>{site.service_area}</p>
            <div className="footer-contact">
              <a href={`mailto:${site.email}`} onClick={() => track('email_click')}>
                <Mail size={14} aria-hidden="true" />
                {site.email}
              </a>
              {site.phone && (
                <a href={`tel:${site.phone}`} onClick={() => track('phone_click')}>
                  <Phone size={14} aria-hidden="true" />
                  {site.phone}
                </a>
              )}
            </div>
            <p>{site.opening_hours}</p>
            <div className="footer-socials">
              {Object.entries(site.socials)
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <a key={k} href={v!} aria-label={k}>
                    {k === 'linkedin' ? <Linkedin size={15} aria-hidden="true" /> : <Globe size={15} aria-hidden="true" />}
                  </a>
                ))}
            </div>
          </div>
          <div>
            <h3>{ui.explore}</h3>
            {nav.footer.company.map((l) => (
              <a key={l.label} href={l.href}>
                {l.label}
              </a>
            ))}
          </div>
          <div>
            <h3>{ui.services}</h3>
            {services
              .filter((s) => s.pillar !== 'secure')
              .map((s) => (
                <a key={s.slug} href={serviceHref(s.slug)}>
                  {s.title}
                </a>
              ))}
          </div>
          <div>
            <h3>{ui.cyberSecurity}</h3>
            {nav.cyber_menu.map((g) => (
              <a key={g.pillar} href={serviceHref(g.items[0])}>
                {g.label}
              </a>
            ))}
            {['cyber-essentials', 'iso-27001', 'penetration-testing'].map((slug) => (
              <a key={slug} href={serviceHref(slug)}>
                {services.find((s) => s.slug === slug)!.title}
              </a>
            ))}
            <a href="/cyber-security/">
              {ui.all} {ui.cyberSecurity.toLowerCase()} ↗
            </a>
          </div>
          <div>
            <h3>{ui.industries}</h3>
            {industries.map((i) => (
              <a key={i.slug} href={industryHref(i.slug)}>
                {i.title}
              </a>
            ))}
          </div>
          <div>
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
            <Suspense>
              <Newsletter />
            </Suspense>
          </div>
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
