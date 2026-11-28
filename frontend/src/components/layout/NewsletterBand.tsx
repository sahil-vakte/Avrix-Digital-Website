import { page, ui } from '../../content';
import Newsletter from '../forms/Newsletter';

/** Full-width newsletter sign-up shown above the footer on every page. */
export default function NewsletterBand() {
  const copy = page('blog').newsletter!;
  return (
    <section className="newsletter-band" aria-labelledby="newsletter-band-title">
      <div className="container newsletter-band-inner">
        <div className="newsletter-copy">
          <p className="eyebrow">{ui.newsletterEyebrow}</p>
          <h2 id="newsletter-band-title">{copy.title}</h2>
          <p>{copy.text}</p>
          <ul className="newsletter-points">
            {ui.newsletterPoints.split('|').map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
        <Newsletter />
      </div>
    </section>
  );
}
