import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  content,
  industries,
  industryHref,
  nav,
  site,
  services,
  solutions,
  serviceHref,
  ui,
} from '../../content';
import { ChevronDown } from 'lucide-react';
import { Button, Icon } from '../ui';

type Menu = 'services' | 'cyber' | 'solutions' | 'industries' | 'resources';
const groupsFor = (kind: Menu) =>
  kind === 'services' ? nav.mega_menu : kind === 'cyber' ? nav.cyber_menu : [];
export default function Header() {
  const [open, setOpen] = useState<Menu | null>(null);
  const [mobile, setMobile] = useState(false);
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
    const desktop = matchMedia('(min-width: 1024px)');
    const resize = () => {
      setOpen(null);
      if (desktop.matches) setMobile(false);
    };
    document.addEventListener('pointerdown', outside);
    desktop.addEventListener('change', resize);
    return () => {
      document.removeEventListener('pointerdown', outside);
      desktop.removeEventListener('change', resize);
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
  function menuType(link: (typeof nav.header)[number]): Menu | null {
    return link.menu || (link.mega ? 'services' : null);
  }
  function panelBody(kind: Menu) {
    if (kind === 'services' || kind === 'cyber')
      return (
        <div className={`nav-service-groups nav-groups-${groupsFor(kind).length}`}>
          {groupsFor(kind).map((group) => (
            <div key={group.pillar}>
              <p className="eyebrow">{group.label}</p>
              <p className="nav-group-blurb">{group.blurb}</p>
              {group.items.map((slug) => {
                const service = services.find((s) => s.slug === slug)!;
                return (
                  <a className="nav-service-link" href={serviceHref(slug)} key={slug}>
                    <Icon name={service.icon} />
                    <span>{service.title}</span>
                    <span aria-hidden="true">›</span>
                  </a>
                );
              })}
            </div>
          ))}
        </div>
      );
    const cards =
      kind === 'solutions'
        ? solutions.map((s) => ({
            href: `/solutions/${s.slug}/`,
            icon: s.icon,
            title: s.title,
            text: s.summary,
          }))
        : kind === 'industries'
          ? industries.map((s) => ({
              href: industryHref(s.slug),
              icon: s.icon,
              title: s.title,
              text: s.summary,
            }))
          : nav.resources.map((r) => ({ href: r.href, icon: r.icon, title: r.label, text: r.text }));
    return (
      <div className={`nav-solution-grid nav-grid-${kind}`}>
        {cards.map((card) => (
          <a href={card.href} key={card.href}>
            <Icon name={card.icon} />
            <strong>
              {card.title}
              <span aria-hidden="true">›</span>
            </strong>
            <small>{card.text}</small>
          </a>
        ))}
      </div>
    );
  }
  return (
    <header
      ref={header}
      className="site-header"
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
        <a className="wordmark" href="/" aria-label={site.brand_name}>
          {content.hasLogo ? (
            <img src={site.logo.dark_on_light} alt={site.logo.alt} width="372" height="85" />
          ) : (
            <>
              {site.brand_name.toUpperCase()}
              <span className="brand-dot" />
            </>
          )}
        </a>
        <nav className="desktop-nav" aria-label="Main">
          {nav.header.map((link) => {
            const kind = menuType(link);
            if (!kind)
              return (
                <a
                  href={link.href}
                  key={link.label}
                  aria-current={pathname === link.href ? 'page' : undefined}
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
                  <span className="nav-chevron" aria-hidden="true">
                    <ChevronDown size={14} strokeWidth={2.25} />
                  </span>
                </button>
                <div
                  className={`nav-panel nav-panel-${kind}`}
                  id={`menu-${kind}`}
                  hidden={open !== kind}
                >
                  <div className="nav-panel-heading">
                    <span>{link.label}</span>
                    <a href={link.href}>
                      {kind === 'resources' ? ui.allInsights : `${ui.all} ${link.label}`}
                      <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                  {panelBody(kind)}
                  <div className="nav-panel-footer">
                    <p>{nav.mega_feature.text}</p>
                    <Button href={nav.mega_feature.cta.href!} size="sm">
                      {nav.mega_feature.cta.label}
                    </Button>
                  </div>
                </div>
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
        >
          {ui.menu}
          <span aria-hidden="true">☰</span>
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
        <button type="button" autoFocus onClick={() => setMobile(false)}>
          {ui.close} ×
        </button>
        <nav aria-label={ui.menu}>
          {nav.header.map((link) => {
            const kind = menuType(link);
            return kind ? (
              <details key={link.label}>
                <summary>{link.label}</summary>
                <a href={link.href}>
                  {ui.all} {link.label}
                </a>
                {kind === 'services' || kind === 'cyber'
                  ? groupsFor(kind).map((group) => (
                      <details key={group.pillar}>
                        <summary>{group.label}</summary>
                        {group.items.map((slug) => (
                          <a key={slug} href={serviceHref(slug)}>
                            {services.find((s) => s.slug === slug)!.title}
                          </a>
                        ))}
                      </details>
                    ))
                  : (kind === 'solutions'
                      ? solutions.map((s) => ({ href: `/solutions/${s.slug}/`, label: s.title }))
                      : kind === 'industries'
                        ? industries.map((s) => ({ href: industryHref(s.slug), label: s.title }))
                        : nav.resources.map((r) => ({ href: r.href, label: r.label }))
                    ).map((item) => (
                      <a href={item.href} key={item.href}>
                        {item.label}
                      </a>
                    ))}
              </details>
            ) : (
              <a href={link.href} key={link.label}>
                {link.label}
              </a>
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
