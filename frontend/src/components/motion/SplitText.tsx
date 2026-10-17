import { useEffect, useRef } from 'react';
/** Measure rendered rows after hydration. Static HTML is always fully visible. */
export function SplitText({ text }: { text: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const heading = ref.current;
    if (!heading || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    const words = Array.from(heading.querySelectorAll<HTMLElement>('.hero-word-mask'));
    const rows = [...new Set(words.map((word) => word.offsetTop))].sort((a, b) => a - b);
    words.forEach((word) =>
      word.style.setProperty(
        '--line-delay',
        `${Math.min(rows.indexOf(word.offsetTop) * 0.08, 0.2)}s`,
      ),
    );
    heading.classList.add('split-ready');
  }, [text]);
  return (
    <h1 ref={ref}>
      {text.split(/(\*[^*]+\*)/g).map((part, index) => {
        const italic = part.startsWith('*');
        const value = italic ? part.slice(1, -1) : part;
        return (
          <span className="heading-run" key={index}>
            {value.split(/(\s+)/).map((word, i) =>
              /^\s+$/.test(word) ? (
                word
              ) : (
                <span className="hero-word-mask" key={i}>
                  <span className="hero-word">{italic ? <em>{word}</em> : word}</span>
                </span>
              ),
            )}
          </span>
        );
      })}
    </h1>
  );
}
