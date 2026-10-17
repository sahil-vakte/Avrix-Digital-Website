import { Head } from 'vite-react-ssg';
import { site } from '../../content';
import { ogSlug, type RouteRecord } from '../../content/routes';
import { jsonLd } from './jsonld';
export default function Seo({ route }: { route: RouteRecord }) {
  const canonical = site.site_url + route.path;
  return (
    <Head>
      <title>{route.seo_title}</title>
      <meta name="description" content={route.seo_description} />
      <link rel="canonical" href={canonical} />
      <meta
        name="robots"
        content={
          route.noindex || import.meta.env.VITE_SITE_ENV !== 'production'
            ? 'noindex,follow'
            : 'index,follow,max-image-preview:large'
        }
      />
      <meta property="og:locale" content="en_GB" />
      <meta property="og:type" content={route.kind === 'post' ? 'article' : 'website'} />
      <meta property="og:site_name" content={site.brand_name} />
      <meta property="og:title" content={route.seo_title} />
      <meta property="og:description" content={route.seo_description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={`${site.site_url}/og/${ogSlug(route.path)}.png`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${site.brand_name}: ${route.seo_title}`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={route.seo_title} />
      <meta name="twitter:description" content={route.seo_description} />
      <meta name="twitter:image" content={`${site.site_url}/og/${ogSlug(route.path)}.png`} />
      <script type="application/ld+json">
        {JSON.stringify(jsonLd(route)).replace(/</g, '\u003c')}
      </script>
    </Head>
  );
}
