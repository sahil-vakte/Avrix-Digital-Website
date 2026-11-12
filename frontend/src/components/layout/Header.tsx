import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { content, nav, site, services, solutions, serviceHref, ui } from '../../content';
import { Button, Icon } from '../ui';

type Menu = 'services' | 'solutions' | 'industries' | 'resources';

export function Brand() {
  return (
    <a className="brand" href="/" aria-label={`${site.brand_name} home`}>
      <img src={site.logo.mark} alt="" width="246" height="192" />
      <span>{site.logo.alt.toUpperCase()}</span>
    </a>
  );
}

/** Links inside each dropdown, shared by the desktop panels and the mobile sheet. */
function menuLinks(kind: Menu) {
  if (kind === 'solutions')
    return solutions.map((s) => ({
      href: `/solutions/${s.slug}/`,
      label: s.title,
      text: s.summary,
      icon: s.icon,
    }));
  if (kind === 'industries')
    return [
      ...content.industries.map((i) => ({
        href: `/industries/${i.slug}/`,
        label: i.title,
        text: i.tagline,
        icon: i.icon,
      })),
      { href: '/industries/', label: ui.allIndustries, text: '', icon: 'compliance' },
    ];
  if (kind === 'resources')
    return nav.resources.map((r) => ({ href: r.href!, label: r.label, text: r.text, icon: '' }));
  return [];
}

export default function Header() {
  const [open, setOpen] = useState<Menu | null>(null);
  const [mobile, setMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const header = useRef<HTMLElement>(null);
  const sheet = useRef<HTMLDialogElement>(null);
  const mobileTrigger = useRef<HTMLButtonElement>(null);
  const activeTrigger = useRef<HTMLButtonElement | null>(null);
  const hoverOpened = useRef(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>();
  const stopTimer = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
  };
  useEffect(() => {
    setOpen(null);
    setMobile(false);
  }, [pathname]);
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setOpen(null);
    };
    const desktop = matchMedia('(min-width: 1100px)');
    const resize = () => {
      setOpen(null);
      if (desktop.matches) setMobile(false);
    };
    const scroll = () => setScrolled(scrollY > 8);
    scroll();
    document.addEventListener('pointerdown', outside);
    desktop.addEventListener('change', resize);
    addEventListener('scroll', scroll, { passive: true });
    return () => {
      document.removeEventListener('pointerdown', outside);
      desktop.removeEventListener('change', resize);
      removeEventListener('scroll', scroll);
      stopTimer();
    };
  }, []);
  useEffect(() => {
    if (!mobile) return;
    const previous = document.body.style.overflow;
    sheet.current?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      sheet.current?.close();
      document.body.style.overflow = previous;
      mobileTrigger.current?.focus();
    };
  }, [mobile]);

  const panel = (kind: Menu, href: string, label: string): ReactNode => {
    if (kind === 'services')
      return (
        <div className="nav-panel nav-panel-services" id="menu-services" hidden={open !== kind}>
          <div className="nav-service-groups">
            {nav.mega_menu.map((group) => (
              <div key={group.pillar}>
                <a className="nav-group-title" href={`/services/#${group.pillar}`}>
                  {group.label}
                </a>
                <p className="nav-group-blurb">{group.blurb}</p>
                {group.items.map((slug) => {
                  const service = services.find((s) => s.slug === slug)!;
                  return (
                    <a className="nav-link-row" href={serviceHref(slug)} key={slug}>
                      <Icon name={service.icon} />
                      <span>{service.title}</span>
                    </a>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="nav-panel-footer">
            <span>{nav.footer.tagline}</span>
            <a href={href}>
              {ui.directory} <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      );
    return (
      <div className={`nav-panel nav-panel-list`} id={`menu-${kind}`} hidden={open !== kind}>
        <p className="nav-group-title">{label}</p>
        {menuLinks(kind).map((l) => (
          <a className="nav-link-card" href={l.href} key={l.href}>
            {l.icon && <Icon name={l.icon} />}
            <span>
              <strong>{l.label}</strong>
              {l.text && <small>{l.text}</small>}
            </span>
          </a>
        ))}
      </div>
    );
  };

  return (
    <header
      ref={header}
      className={`site-header ${scrolled ? 'scrolled' : ''}`}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.preventDefault();
          setOpen(null);
          stopTimer();
          activeTrigger.current?.focus();
        }
        if (open && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
          const links = Array.from(
            header.current?.querySelectorAll<HTMLAnchorElement>(`#menu-${open} a`) || [],
          );
          if (!links.length) return;
          event.preventDefault();
          const current = links.indexOf(document.activeElement as HTMLAnchorElement);
          const next =
            event.key === 'Home'
              ? 0
              : event.key === 'End'
                ? links.length - 1
                : current < 0
                  ? event.key === 'ArrowUp'
                    ? links.length - 1
                    : 0
                  : (current + (event.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
          links[next]?.focus();
        }
      }}
    >
      <div className="container header-inner">
        <Brand />
        <nav className="desktop-nav" aria-label="Main">
          {nav.header.map((link) => {
            const kind = link.menu;
            const current =
              link.href === '/' ? pathname === '/' : pathname.startsWith(link.href || '#');
            if (!kind)
              return (
                <a
                  href={link.href}
                  key={link.label}
                  aria-current={pathname === link.href ? 'page' : undefined}
                  className={current ? 'active' : undefined}
                >
                  {link.label}
                </a>
              );
            return (
              <div
                className="nav-disclosure"
                key={kind}
                onMouseEnter={(event) => {
                  stopTimer();
                  if (open !== kind) hoverOpened.current = true;
                  activeTrigger.current = event.currentTarget.querySelector('button');
                  setOpen(kind);
                }}
                onMouseLeave={() => {
                  stopTimer();
                  leaveTimer.current = setTimeout(() => setOpen(null), 180);
                }}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) setOpen(null);
                }}
              >
                <button
                  type="button"
                  className={current ? 'active' : undefined}
                  aria-expanded={open === kind}
                  aria-controls={`menu-${kind}`}
                  onClick={(event) => {
                    stopTimer();
                    activeTrigger.current = event.currentTarget;
                    setOpen(hoverOpened.current ? kind : open === kind ? null : kind);
                    hoverOpened.current = false;
                  }}
                >
                  {link.label}
                  <span className="nav-chevron" aria-hidden="true" />
                </button>
                {panel(kind, link.href!, link.label)}
              </div>
            );
          })}
        </nav>
        <div className="desktop-cta">
          <Button href={nav.header_cta.href!} size="sm">
            {nav.header_cta.label}
          </Button>
        </div>
        <button
          ref={mobileTrigger}
          type="button"
          className="menu-toggle"
          onClick={() => setMobile(true)}
          aria-haspopup="dialog"
          aria-label={ui.menu}
        >
          <span aria-hidden="true" />
        </button>
      </div>
      <dialog
        ref={sheet}
        className="mobile-sheet"
        onCancel={() => setMobile(false)}
        onClose={() => setMobile(false)}
        aria-label={ui.menu}
        onClick={(event) => {
          if ((event.target as HTMLElement).closest('a')) setMobile(false);
        }}
      >
        <div className="mobile-sheet-top">
          <Brand />
          <button type="button" className="sheet-close" autoFocus onClick={() => setMobile(false)}>
            <span className="sr-only">{ui.close}</span>
            <span aria-hidden="true">✕</span>
          </button>
        </div>
        <nav aria-label={ui.menu}>
          {nav.header.map((link) => {
            const kind = link.menu;
            if (!kind)
              return (
                <a href={link.href} key={link.label} className="sheet-link">
                  {link.label}
                </a>
              );
            return (
              <details key={link.label}>
                <summary>{link.label}</summary>
                <a href={link.href} className="sheet-sub">
                  {ui.all} {link.label}
                </a>
                {kind === 'services'
                  ? nav.mega_menu.map((group) => (
                      <details key={group.pillar}>
                        <summary>{group.label}</summary>
                        {group.items.map((slug) => (
                          <a key={slug} className="sheet-sub" href={serviceHref(slug)}>
                            {services.find((s) => s.slug === slug)!.title}
                          </a>
                        ))}
                      </details>
                    ))
                  : menuLinks(kind).map((l) => (
                      <a key={l.href} className="sheet-sub" href={l.href}>
                        {l.label}
                        {l.text && <small>{l.text}</small>}
                      </a>
                    ))}
              </details>
            );
          })}
        </nav>
        <Button href={nav.header_cta.href!}>{nav.header_cta.label}</Button>
      </dialog>
      <noscript>
        <nav className="container nojs-nav">
          {nav.header.map((link) => (
            <a key={link.label} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
      </noscript>
    </header>
  );
}
