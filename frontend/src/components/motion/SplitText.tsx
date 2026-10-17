/** Keep the prerendered headline visible throughout hydration. */
export function SplitText({ text }: { text: string }) {
  return (
    <h1>
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
