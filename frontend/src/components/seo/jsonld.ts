import { content, site, services, solutions, posts, serviceHref, postHref } from '../../content';
import type { RouteRecord } from '../../content/routes';
export function jsonLd(route: RouteRecord) {
  const base = site.site_url;
  const org = {
    '@type': 'Organization',
    '@id': `${base}/#organization`,
    name: site.brand_name,
    url: base,
    email: site.email,
    ...(site.legal_name ? { legalName: site.legal_name } : {}),
    ...(site.phone ? { telephone: site.phone } : {}),
    ...(site.registered_office ? { address: site.registered_office } : {}),
    ...(content.hasLogo
      ? {
          logo: {
            '@type': 'ImageObject',
            '@id': `${base}/#logo`,
            url: base + (site.logo.search || site.logo.light_on_dark),
            contentUrl: base + (site.logo.search || site.logo.light_on_dark),
            ...(site.logo.search ? { width: 512, height: 160 } : {}),
            caption: site.logo.alt,
          },
        }
      : {}),
    sameAs: Object.values(site.socials).filter(Boolean),
  };
  const graph: Record<string, unknown>[] = [
    org,
    {
      '@type': 'WebSite',
      '@id': `${base}/#website`,
      name: site.brand_name,
      url: base,
      inLanguage: 'en-GB',
    },
  ];
  const provider = { '@id': org['@id'] };
  if (route.kind === 'home')
    graph.push({
      '@type': 'ProfessionalService',
      name: site.brand_name,
      url: base,
      email: site.email,
      areaServed: 'GB',
      priceRange: '££',
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: site.brand_name,
        itemListElement: services.map((s) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: s.title, url: base + serviceHref(s.slug) },
        })),
      },
    });
  let faqs =
    route.kind === 'faqs'
      ? [...content.faqs.groups.flatMap((g) => g.items), ...services.flatMap((s) => s.faqs)]
      : [];
  if (route.kind === 'service') {
    const s = services.find((s) => s.slug === route.slug)!;
    faqs = s.faqs;
    graph.push({
      '@type': 'Service',
      name: s.title,
      description: s.summary,
      url: base + route.path,
      provider,
      areaServed: 'GB',
      ...(s.pricing?.price_from != null
        ? { offers: { '@type': 'Offer', price: s.pricing.price_from, priceCurrency: 'GBP' } }
        : {}),
    });
  }
  if (faqs.length)
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  if (route.kind === 'solution') {
    const solution = solutions.find((s) => s.slug === route.slug)!;
    graph.push({
      '@type': 'Service',
      name: solution.title,
      description: solution.summary,
      url: base + route.path,
      provider,
      areaServed: 'GB',
    });
    graph.push({
      '@type': 'FAQPage',
      mainEntity: solution.faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }
  if (route.kind === 'blog')
    graph.push({ '@type': 'Blog', name: route.h1, url: base + route.path, publisher: provider });
  if (route.kind === 'post') {
    const p = posts.find((p) => p.slug === route.slug)!;
    graph.push({
      '@type': 'BlogPosting',
      headline: p.title,
      datePublished: p.published,
      dateModified: p.updated,
      image: base + p.cover.src,
      author: { '@type': 'Organization', name: content.ui.author },
      publisher: provider,
      mainEntityOfPage: base + postHref(p.slug),
    });
  }
  if (route.kind === 'about' || route.kind === 'contact')
    graph.push({
      '@type': route.kind === 'about' ? 'AboutPage' : 'ContactPage',
      name: route.h1.replaceAll('*', ''),
      url: base + route.path,
      about: provider,
    });
  if (route.path !== '/') {
    const parts = [{ name: content.ui.home, item: base + '/' }];
    if (route.kind === 'service')
      parts.push({ name: content.ui.services, item: base + '/services/' });
    if (route.kind === 'solution')
      parts.push({ name: content.ui.solutions, item: base + '/solutions/' });
    if (route.kind === 'post')
      parts.push({
        name: content.pages.find((p) => p.slug === 'blog')!.h1.replaceAll('*', ''),
        item: base + '/blog/',
      });
    parts.push({ name: route.h1.replaceAll('*', ''), item: base + route.path });
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: parts.map((p, i) => ({ '@type': 'ListItem', position: i + 1, ...p })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}
