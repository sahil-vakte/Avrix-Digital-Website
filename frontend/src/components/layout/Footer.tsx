import { content, site, nav, ui } from '../../content';
import { track } from '../../lib/analytics';
import { openCookiePreferences } from '../../lib/overlay';
import { Brand } from './Header';

/** Expanded light footer: brand and contact, link directory, utilities. */
export default function Footer() {
  const socials = Object.entries(site.socials).filter(([, v]) => v);
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Brand />
            <p>{nav.footer.tagline}</p>
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
          <div className="footer-actions">
            <a className="button primary" href="#enquiry">
              {site.booking_label} <span aria-hidden="true">→</span>
            </a>
            <a className="button secondary" href="/contact-us/">
              {ui.contactUs} <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
        <nav className="footer-grid" aria-label={ui.footerNav}>
          <div>
            <h2>{ui.explore}</h2>
            <ul>
              {nav.footer.explore.map((l) => (
                <li key={l.label}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>{ui.services}</h2>
            <ul>
              {nav.mega_menu.map((g) => (
                <li key={g.pillar}>
                  <a href={g.href}>{g.label}</a>
                </li>
              ))}
              <li>
                <a href="/services/incident-response/">{ui.incidentResponse}</a>
              </li>
            </ul>
          </div>
          <div>
            <h2>{ui.popularServices}</h2>
            <ul>
              {nav.footer.shortcuts.map((l) => (
                <li key={l.href}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>{ui.industries}</h2>
            <ul>
              {content.industries.map((i) => (
                <li key={i.slug}>
                  <a href={`/industries/${i.slug}/`}>{i.title}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>{ui.legal}</h2>
            <ul>
              {nav.footer.legal
                .filter((l) => !l.action)
                .map((l) => (
                  <li key={l.label}>
                    <a href={l.href}>{l.label}</a>
                  </li>
                ))}
            </ul>
          </div>
        </nav>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {site.legal_name || site.brand_name}. {ui.rightsReserved}{' '}
            {site.company_number && `${ui.registration} ${site.company_number}. `}
            {site.registered_office && `${ui.office} ${site.registered_office}. `}
            {site.vat_number && `${ui.vat} ${site.vat_number}`}
          </span>
          <div className="footer-utilities">
            <a className="back-top" href="#main">
              {ui.backToTop} <span aria-hidden="true">↑</span>
            </a>
            <button type="button" onClick={openCookiePreferences}>
              {ui.cookiePreferences}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
