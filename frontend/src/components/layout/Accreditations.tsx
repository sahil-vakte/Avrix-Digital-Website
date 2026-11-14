import { accreditations, ui } from '../../content';

// Text first, then every accreditation logo in a single row.
export default function Accreditations() {
  if (!accreditations.items.length) return null;
  return (
    <section className="accreditations" aria-labelledby="accreditations-title">
      <div className="container accreditations-inner">
        <div className="accreditations-head">
          <p className="eyebrow">{accreditations.eyebrow}</p>
          <h2 id="accreditations-title">{accreditations.title}</h2>
        </div>
        <ul className="accreditations-logos">
          {accreditations.items.map((item) => {
            const label = [
              item.text,
              item.reference && `${ui.accreditationReference}: ${item.reference}`,
            ]
              .filter(Boolean)
              .join(' ');
            const logo = <img src={item.logo} alt={item.name} height="56" loading="lazy" />;
            return (
              <li key={item.name} title={label}>
                {item.href ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer">
                    {logo}
                    <span className="sr-only">{label} (opens in a new tab)</span>
                  </a>
                ) : (
                  logo
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
