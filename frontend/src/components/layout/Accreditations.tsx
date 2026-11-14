import { accreditations, ui } from '../../content';
export default function Accreditations() {
  if (!accreditations.items.length) return null;
  return (
    <section className="accreditations" aria-labelledby="accreditations-title">
      <div className="container">
        <div className="accreditations-head">
          <p className="eyebrow">{accreditations.eyebrow}</p>
          <h2 id="accreditations-title">{accreditations.title}</h2>
        </div>
        <ul className="accreditations-list">
          {accreditations.items.map((item) => {
            const body = (
              <>
                <img src={item.logo} alt={item.name} width="168" height="67" loading="lazy" />
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.text}</small>
                  {item.reference && (
                    <small>
                      {ui.accreditationReference}: {item.reference}
                    </small>
                  )}
                </span>
              </>
            );
            return (
              <li key={item.name}>
                {item.href ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer">
                    {body}
                  </a>
                ) : (
                  <div>{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
