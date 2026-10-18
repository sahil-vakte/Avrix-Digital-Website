import { solutions, ui } from '../../content';
import type { Solution } from '../../content/schemas';
import { Icon } from '../ui';

export default function SolutionCards({ items = solutions }: { items?: Solution[] }) {
  return (
    <div className="solution-cards grid stagger">
      {items.map((s) => (
        <article className={`solution-card solution-${s.slug}`} key={s.slug}>
          <a
            className="solution-preview-link"
            href={`/solutions/${s.slug}/`}
            tabIndex={-1}
            aria-hidden="true"
          >
            <img src={s.preview.src} alt="" width="1200" height="760" loading="lazy" />
          </a>
          <div className="solution-card-copy">
            <div className="solution-card-title">
              <Icon name={s.icon} />
              <h3>
                <a href={`/solutions/${s.slug}/`}>{s.title}</a>
              </h3>
            </div>
            <p>{s.summary}</p>
            <a
              className="solution-card-link"
              href={`/solutions/${s.slug}/`}
              aria-label={`${ui.exploreSolution}: ${s.title}`}
            >
              {ui.exploreSolution}
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}
