import type { Kind, Special } from '../game/types';

interface CandyIconProps {
  kind: Kind;
  special?: Special;
  ice?: number;
  className?: string;
}

const RAINBOW = ['#ff8fb1', '#ffd166', '#8fbf6a', '#6aa8ff', '#b9a4f0', '#ffb36b'];

/** Dibujo SVG procedural de cada ingrediente (sin imágenes externas). */
function KindArt({ kind }: { kind: Kind }) {
  switch (kind) {
    case 'perla':
      return (
        <>
          <defs>
            <radialGradient id="g-perla" cx="38%" cy="32%" r="70%">
              <stop offset="0%" stopColor="#7a5440" />
              <stop offset="60%" stopColor="#3a2317" />
              <stop offset="100%" stopColor="#1a0e08" />
            </radialGradient>
          </defs>
          <circle cx="32" cy="34" r="25" fill="url(#g-perla)" />
          <circle cx="24" cy="27" r="4.5" fill="#fff" opacity="0.55" />
          <circle cx="40" cy="42" r="2" fill="#fff" opacity="0.18" />
        </>
      );
    case 'mango':
      return (
        <>
          <defs>
            <radialGradient id="g-mango" cx="40%" cy="35%" r="70%">
              <stop offset="0%" stopColor="#fff6b0" />
              <stop offset="55%" stopColor="#ffd23f" />
              <stop offset="100%" stopColor="#f0a500" />
            </radialGradient>
          </defs>
          <circle cx="32" cy="32" r="26" fill="url(#g-mango)" opacity="0.92" />
          <circle cx="32" cy="32" r="13" fill="#fff9cf" opacity="0.55" />
          <circle cx="25" cy="24" r="4" fill="#fff" opacity="0.8" />
        </>
      );
    case 'fresa':
      return (
        <>
          <defs>
            <radialGradient id="g-fresa" cx="40%" cy="34%" r="70%">
              <stop offset="0%" stopColor="#ffd0de" />
              <stop offset="60%" stopColor="#ff8fb1" />
              <stop offset="100%" stopColor="#e0517d" />
            </radialGradient>
          </defs>
          <circle cx="32" cy="33" r="25" fill="url(#g-fresa)" />
          {[
            [22, 26],
            [36, 22],
            [42, 36],
            [28, 42],
            [18, 40],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" fill="#b8325c" opacity="0.7" />
          ))}
          <ellipse cx="24" cy="25" rx="5" ry="3.2" fill="#fff" opacity="0.6" transform="rotate(-25 24 25)" />
        </>
      );
    case 'matcha':
      return (
        <>
          <defs>
            <linearGradient id="g-matcha" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#c9ee9b" />
              <stop offset="100%" stopColor="#4f8f4a" />
            </linearGradient>
          </defs>
          <path d="M13 22 H51 L46.5 49 Q45.5 56 38.5 56 H25.5 Q18.5 56 17.5 49 Z" fill="url(#g-matcha)" />
          <ellipse cx="32" cy="22" rx="19" ry="5" fill="#eaffd6" stroke="#4f8f4a" strokeWidth="1.2" />
          <path d="M26 38 Q32 30 38 38 Q32 44 26 38 Z" fill="#fff" opacity="0.5" />
          <path d="M16 30 Q24 28 22 40" stroke="#fff" strokeOpacity="0.45" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </>
      );
    case 'taro':
      return (
        <>
          <defs>
            <linearGradient id="g-taro" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#eadbff" />
              <stop offset="100%" stopColor="#7d62c9" />
            </linearGradient>
          </defs>
          <rect x="11" y="11" width="42" height="42" rx="15" fill="url(#g-taro)" />
          <path
            d="M32 20 C44 20 44 32 36 33 C29 34 28 44 36 44"
            stroke="#fff"
            strokeOpacity="0.7"
            strokeWidth="3.2"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="22" cy="22" r="3" fill="#fff" opacity="0.6" />
        </>
      );
    case 'leche':
      return (
        <>
          <defs>
            <linearGradient id="g-leche" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#d9e4f2" />
            </linearGradient>
          </defs>
          <path
            d="M32 7 C32 7 15 29 15 41 A17 17 0 0 0 49 41 C49 29 32 7 32 7 Z"
            fill="url(#g-leche)"
            stroke="#b9c9dd"
            strokeWidth="1.5"
          />
          <ellipse cx="25" cy="38" rx="3.5" ry="6" fill="#fff" opacity="0.9" />
        </>
      );
    default:
      return null;
  }
}

function SpecialArt({ kind, special }: { kind: Kind; special: Special }) {
  if (special === 'striped-h' || special === 'striped-v') {
    const horizontal = special === 'striped-h';
    return (
      <>
        <defs>
          <clipPath id={`clip-${special}`}>
            <circle cx="32" cy="32" r="26" />
          </clipPath>
        </defs>
        <circle cx="32" cy="32" r="26" fill="#fff8e6" opacity="0.2" />
        <g clipPath={`url(#clip-${special})`}>
          {[0, 1, 2].map((i) =>
            horizontal ? (
              <rect key={i} x="4" y={14 + i * 14} width="56" height="6" rx="3" fill="#fff" opacity="0.92" />
            ) : (
              <rect key={i} x={14 + i * 14} y="4" width="6" height="56" rx="3" fill="#fff" opacity="0.92" />
            ),
          )}
        </g>
        <circle cx="32" cy="32" r="26" fill="none" stroke="#fff" strokeWidth="2" opacity="0.8" />
        <CandyIconGlow kind={kind} />
      </>
    );
  }
  if (special === 'bomb') {
    return (
      <>
        <circle cx="32" cy="32" r="27" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="6 5" opacity="0.9" />
        <path
          d="M32 15 L35 29 L49 32 L35 35 L32 49 L29 35 L15 32 L29 29 Z"
          fill="#fff"
          opacity="0.92"
        />
        <circle cx="32" cy="32" r="5" fill={kind === 'perla' ? '#ffd166' : '#3b2a24'} opacity="0.85" />
      </>
    );
  }
  // rainbow
  const r = 18;
  const circ = 2 * Math.PI * r;
  return (
    <>
      <circle cx="32" cy="32" r="24" fill="#fff" />
      {RAINBOW.map((color, i) => (
        <circle
          key={color}
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeDasharray={`${circ / 6 - 1.5} ${circ}`}
          strokeDashoffset={-(i * circ) / 6}
          transform="rotate(-90 32 32)"
        />
      ))}
      <path d="M32 22 L34 30 L42 32 L34 34 L32 42 L30 34 L22 32 L30 30 Z" fill="#fff" />
    </>
  );
}

function CandyIconGlow({ kind }: { kind: Kind }) {
  return <circle cx="24" cy="24" r="4" fill={kind === 'leche' ? '#6a7d96' : '#fff'} opacity="0.5" />;
}

function IceOverlay({ layers }: { layers: number }) {
  return (
    <g>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="#bfe9ff" opacity={layers >= 2 ? 0.55 : 0.4} />
      <rect x="4" y="4" width="56" height="56" rx="16" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.9" />
      <path d="M14 20 L24 30 L20 42" stroke="#ffffff" strokeWidth="1.6" fill="none" opacity="0.8" />
      {layers >= 2 && (
        <path d="M46 14 L38 28 L50 36" stroke="#ffffff" strokeWidth="1.6" fill="none" opacity="0.8" />
      )}
    </g>
  );
}

/** Una ficha dibujada totalmente en SVG, con power-up e hielo opcionales. */
export function CandyIcon({ kind, special = 'none', ice = 0, className }: CandyIconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      {special === 'rainbow' ? (
        <SpecialArt kind={kind} special={special} />
      ) : (
        <>
          <KindArt kind={kind} />
          {special !== 'none' && <SpecialArt kind={kind} special={special} />}
        </>
      )}
      {ice > 0 && <IceOverlay layers={ice} />}
    </svg>
  );
}
