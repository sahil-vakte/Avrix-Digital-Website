import { accreditations, ui } from '../../content';
import { SectionShell } from '../sections';

// Same pattern as "What happens next": heading and intro, then logo cards
// centred underneath. Add logos in content/accreditations.json.
export default function Accreditations() {
  if (!accreditations.items.length) return null;
  return (
    <aside aria-label={accreditations.eyebrow}>
      <SectionShell
        tone="tint"
        className="accreditations"
        eyebrow={accreditations.eyebrow}
        title={accreditations.title}
        intro={accreditations.intro}
      >
        <ul className="accreditations-logos">
          {accreditations.items.map((item) => {
            const label = [
              item.text,
              item.reference && `${ui.accreditationReference}: ${item.reference}`,
            ]
              .filter(Boolean)
              .join(' ');
            const body = (
              <>
                <span className="accreditation-logo">
                  <img src={item.logo} alt={item.name} height="64" loading="lazy" />
                </span>
                <span className="accreditation-label">{item.label}</span>
                {item.reference && (
                  <small>
                    {ui.accreditationReference}: {item.reference}
                  </small>
                )}
              </>
            );
            return (
              <li key={item.name} title={label}>
                {item.href ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer">
                    {body}
                    <span className="sr-only">{item.text} (opens in a new tab)</span>
                  </a>
                ) : (
                  <div>{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      </SectionShell>
    </aside>
  );
}
