// Original illustration: a tall, slightly wobbly red-and-white striped hat.
export function HatIcon({ className = "h-9 w-9", title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title ? <title>{title}</title> : null}
      <defs>
        <clipPath id="hat-crown">
          <path d="M19 50 C18 36 15 22 18.5 10.5 C26 6.5 37 6 44.5 9.5 C46.5 22 45.5 36 45 50 Z" />
        </clipPath>
      </defs>
      <g transform="rotate(-8 32 34)">
        <g clipPath="url(#hat-crown)">
          <rect x="10" y="4" width="44" height="50" fill="#fff" />
          <rect x="10" y="4" width="44" height="9" fill="#e63946" />
          <rect x="10" y="21" width="44" height="8" fill="#e63946" />
          <rect x="10" y="37" width="44" height="8" fill="#e63946" />
        </g>
        <path
          d="M19 50 C18 36 15 22 18.5 10.5 C26 6.5 37 6 44.5 9.5 C46.5 22 45.5 36 45 50 Z"
          fill="none" stroke="#1d3557" strokeWidth="3" strokeLinejoin="round"
        />
        <ellipse cx="32" cy="52" rx="24" ry="6.5" fill="#e63946" stroke="#1d3557" strokeWidth="3" />
        <path d="M22 13 C21 22 21 30 22 40" stroke="#fff" strokeOpacity=".7" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </g>
      <path d="M53 8 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6z" fill="#ffd166" stroke="#1d3557" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display text-2xl font-bold tracking-tight ${className}`}>
      Hat<span className="text-hat">S</span>potted
    </span>
  );
}
