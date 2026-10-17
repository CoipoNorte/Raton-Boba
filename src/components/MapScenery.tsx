import { memo } from 'react';
import type { SceneKind, ZoneInfo } from '../game/levels';

/**
 * Escenografía ilustrada del mapa de la Tienda.
 * Todo es SVG procedural, decorativo y sin eventos de puntero: nunca tapa
 * los nodos de nivel (que viven entre el 22 % y el 78 % del ancho).
 */

/* -------------------------------------------------------------------------- */
/*                            Props reutilizables                             */
/* -------------------------------------------------------------------------- */

/** Vaso de boba con volumen, brillo y perlas. */
function BobaCup({ hue = '#ffb7c9', lid = '#7d62c9' }: { hue?: string; lid?: string }) {
  return (
    <svg viewBox="0 0 100 130" className="h-full w-full">
      <ellipse cx="50" cy="122" rx="26" ry="6" fill="#000" opacity="0.14" />
      <path d="M26 30 H74 L68 108 Q66 120 50 120 Q34 120 32 108 Z" fill="#fffdf7" stroke="#e3d6c4" strokeWidth="2.5" />
      <path d="M30 62 H70 L66 106 Q64 116 50 116 Q36 116 34 106 Z" fill={hue} opacity="0.9" />
      <path d="M30 62 H70 L69 72 H31 Z" fill="#fff" opacity="0.35" />
      <rect x="22" y="24" width="56" height="10" rx="5" fill={lid} />
      <rect x="22" y="24" width="56" height="4" rx="2" fill="#fff" opacity="0.4" />
      <rect x="56" y="2" width="8" height="30" rx="4" fill={lid} opacity="0.85" />
      <circle cx="42" cy="104" r="5" fill="#3b2a24" />
      <circle cx="56" cy="107" r="5.5" fill="#3b2a24" />
      <circle cx="49" cy="94" r="4.5" fill="#3b2a24" />
      <circle cx="62" cy="96" r="4" fill="#3b2a24" />
      <path d="M37 70 Q35 88 39 104" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

/** Farolillo de papel con luz cálida. */
function Lantern({ hue = '#e0517d' }: { hue?: string }) {
  return (
    <svg viewBox="0 0 70 110" className="h-full w-full">
      <line x1="35" y1="0" x2="35" y2="16" stroke="#8a6a4a" strokeWidth="2.5" />
      <rect x="22" y="14" width="26" height="7" rx="3" fill="#8a6a4a" />
      <ellipse cx="35" cy="52" rx="29" ry="32" fill={hue} />
      <ellipse cx="35" cy="52" rx="29" ry="32" fill="url(#lantern-shine)" />
      <ellipse cx="26" cy="44" rx="7" ry="14" fill="#fff" opacity="0.3" />
      <path d="M12 38 Q35 46 58 38" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.45" />
      <path d="M10 60 Q35 68 60 60" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.45" />
      <rect x="22" y="82" width="26" height="7" rx="3" fill="#8a6a4a" />
      <path d="M30 89 L30 104 M40 89 L40 104 M35 89 L35 108" stroke="#f2c14e" strokeWidth="2.5" strokeLinecap="round" />
      <defs>
        <radialGradient id="lantern-shine" cx="35%" cy="32%" r="70%">
          <stop offset="0%" stopColor="#fff6c9" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/** Árbol de sakura frondoso. */
function SakuraTree() {
  return (
    <svg viewBox="0 0 140 150" className="h-full w-full">
      <ellipse cx="70" cy="144" rx="36" ry="6" fill="#000" opacity="0.12" />
      <path d="M66 148 L66 92 Q58 78 44 72 M70 110 Q82 96 98 90" stroke="#8a6245" strokeWidth="9" strokeLinecap="round" fill="none" />
      <circle cx="46" cy="62" r="26" fill="#ffc3d6" />
      <circle cx="90" cy="56" r="30" fill="#ffd3e2" />
      <circle cx="68" cy="38" r="26" fill="#ffb7c9" />
      <circle cx="104" cy="82" r="20" fill="#ffc9da" />
      <circle cx="40" cy="88" r="18" fill="#ffd9e6" />
      <circle cx="60" cy="30" r="7" fill="#fff" opacity="0.6" />
      <circle cx="96" cy="46" r="5" fill="#fff" opacity="0.5" />
      <circle cx="52" cy="74" r="4" fill="#fff" opacity="0.5" />
    </svg>
  );
}

/** Tetera humeante sobre fogón. */
function TeaPot() {
  return (
    <svg viewBox="0 0 130 120" className="h-full w-full">
      <ellipse cx="65" cy="112" rx="38" ry="7" fill="#000" opacity="0.12" />
      <path d="M20 52 Q10 46 18 38 Q26 34 30 44" stroke="#b9a4f0" strokeWidth="7" fill="none" strokeLinecap="round" />
      <ellipse cx="68" cy="74" rx="40" ry="34" fill="#e8dff5" stroke="#9f87d8" strokeWidth="3" />
      <ellipse cx="68" cy="66" rx="30" ry="18" fill="#fff" opacity="0.45" />
      <path d="M104 62 Q124 58 118 84 Q110 80 104 76" fill="#cbb9ff" stroke="#9f87d8" strokeWidth="2.5" />
      <rect x="52" y="36" width="32" height="8" rx="4" fill="#9f87d8" />
      <circle cx="68" cy="33" r="7" fill="#ffd166" stroke="#c98a00" strokeWidth="2" />
      <path d="M50 18 Q44 6 54 -2" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.75" />
      <path d="M68 14 Q76 2 68 -8" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

/** Tarro de perlas de tapioca. */
function PearlJar({ hue = '#3b2a24' }: { hue?: string }) {
  return (
    <svg viewBox="0 0 90 120" className="h-full w-full">
      <ellipse cx="45" cy="114" rx="28" ry="6" fill="#000" opacity="0.12" />
      <rect x="14" y="26" width="62" height="86" rx="16" fill="#fffdf7" stroke="#dcccb6" strokeWidth="3" />
      <rect x="20" y="62" width="50" height="46" rx="12" fill={hue} opacity="0.85" />
      <rect x="18" y="14" width="54" height="16" rx="8" fill="#c9843f" />
      <rect x="18" y="14" width="54" height="6" rx="3" fill="#fff" opacity="0.3" />
      {[
        [30, 78],
        [45, 86],
        [60, 76],
        [38, 96],
        [56, 98],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="5.5" fill="#1d120b" />
      ))}
      <rect x="22" y="34" width="10" height="34" rx="5" fill="#fff" opacity="0.5" />
    </svg>
  );
}

/** Tarro de galletas con chispas. */
function CookieJar() {
  return (
    <svg viewBox="0 0 100 120" className="h-full w-full">
      <ellipse cx="50" cy="114" rx="30" ry="6" fill="#000" opacity="0.12" />
      <rect x="16" y="34" width="68" height="78" rx="18" fill="#f3e6ff" stroke="#9655d9" strokeWidth="3" />
      <rect x="20" y="20" width="60" height="16" rx="8" fill="#7d62c9" />
      <circle cx="38" cy="62" r="13" fill="#d99859" stroke="#a9682f" strokeWidth="2" />
      <circle cx="35" cy="58" r="2.6" fill="#4a2508" />
      <circle cx="43" cy="65" r="2.2" fill="#4a2508" />
      <circle cx="64" cy="78" r="15" fill="#e0a86b" stroke="#a9682f" strokeWidth="2" />
      <circle cx="60" cy="74" r="2.8" fill="#4a2508" />
      <circle cx="69" cy="82" r="2.4" fill="#4a2508" />
      <circle cx="38" cy="92" r="11" fill="#d99859" stroke="#a9682f" strokeWidth="2" />
      <circle cx="36" cy="90" r="2.2" fill="#4a2508" />
    </svg>
  );
}

/** Cristal de hielo con brillo. */
function IceCrystal({ hue = '#bfe9ff' }: { hue?: string }) {
  return (
    <svg viewBox="0 0 80 90" className="h-full w-full">
      <path d="M40 4 L70 24 L70 64 L40 86 L10 64 L10 24 Z" fill={hue} stroke="#fff" strokeWidth="3" />
      <path d="M40 4 L40 86 M10 24 L70 64 M70 24 L10 64" stroke="#fff" strokeWidth="2" opacity="0.7" />
      <path d="M40 4 L70 24 L40 44 Z" fill="#fff" opacity="0.4" />
    </svg>
  );
}

/** Matraz burbujeante del laboratorio. */
function Flask({ hue = '#ffd166' }: { hue?: string }) {
  return (
    <svg viewBox="0 0 100 120" className="h-full w-full">
      <ellipse cx="50" cy="114" rx="30" ry="6" fill="#000" opacity="0.12" />
      <path d="M40 14 H60 V52 L86 100 Q92 112 78 112 H22 Q8 112 14 100 Z" fill="#fffdf7" stroke="#c9a74f" strokeWidth="3" />
      <path d="M24 84 H76 L84 100 Q88 108 76 108 H24 Q12 108 16 100 Z" fill={hue} opacity="0.9" />
      <rect x="36" y="8" width="28" height="10" rx="5" fill="#c9a74f" />
      <circle cx="40" cy="96" r="5" fill="#fff" opacity="0.85" />
      <circle cx="58" cy="92" r="6" fill="#fff" opacity="0.8" />
      <circle cx="50" cy="76" r="4" fill={hue} opacity="0.9" />
      <circle cx="62" cy="64" r="3" fill={hue} opacity="0.7" />
    </svg>
  );
}

/** Puesto de mercado con toldo. */
function MarketStall({ hue = '#e0517d' }: { hue?: string }) {
  return (
    <svg viewBox="0 0 160 130" className="h-full w-full">
      <ellipse cx="80" cy="124" rx="56" ry="6" fill="#000" opacity="0.12" />
      <rect x="24" y="60" width="112" height="60" rx="8" fill="#f6e3cd" stroke="#b98c5a" strokeWidth="3" />
      <path d="M14 58 L80 20 L146 58 Z" fill={hue} />
      <path d="M14 58 H146 L138 70 H22 Z" fill="#fffdf7" opacity="0.9" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={20 + i * 26} y="58" width="13" height="12" rx="3" fill={hue} opacity="0.75" />
      ))}
      <rect x="40" y="78" width="30" height="34" rx="6" fill="#ffd166" stroke="#c98a00" strokeWidth="2" />
      <rect x="86" y="78" width="30" height="34" rx="6" fill="#b9a4f0" stroke="#7d62c9" strokeWidth="2" />
      <circle cx="55" cy="95" r="5" fill="#fff" opacity="0.7" />
      <circle cx="101" cy="95" r="5" fill="#fff" opacity="0.7" />
    </svg>
  );
}

/** Ola estilizada de la costa. */
function Wave({ hue = '#8fd3f4' }: { hue?: string }) {
  return (
    <svg viewBox="0 0 160 70" className="h-full w-full">
      <path d="M0 48 Q26 20 52 48 T104 48 T156 48 L160 70 H0 Z" fill={hue} opacity="0.85" />
      <path d="M0 56 Q30 34 60 56 T120 56 T160 56 L160 70 H0 Z" fill="#fff" opacity="0.35" />
      <circle cx="40" cy="36" r="4" fill="#fff" opacity="0.8" />
      <circle cx="96" cy="32" r="5" fill="#fff" opacity="0.7" />
    </svg>
  );
}

/** Pagoda del templo final. */
function Pagoda({ hue = '#c08a1e' }: { hue?: string }) {
  return (
    <svg viewBox="0 0 150 160" className="h-full w-full">
      <ellipse cx="75" cy="152" rx="54" ry="7" fill="#000" opacity="0.14" />
      <path d="M10 46 L75 14 L140 46 Z" fill={hue} />
      <path d="M22 48 H128 L120 62 H30 Z" fill="#f6e3cd" stroke="#b98c5a" strokeWidth="2" />
      <path d="M20 86 L75 58 L130 86 Z" fill={hue} opacity="0.92" />
      <path d="M30 88 H120 L114 102 H36 Z" fill="#f6e3cd" stroke="#b98c5a" strokeWidth="2" />
      <path d="M28 124 L75 98 L122 124 Z" fill={hue} opacity="0.88" />
      <rect x="38" y="126" width="74" height="26" rx="5" fill="#f6e3cd" stroke="#b98c5a" strokeWidth="2.5" />
      <rect x="66" y="132" width="18" height="20" rx="4" fill="#b85c38" />
      <circle cx="75" cy="10" r="6" fill="#ffd166" stroke="#c98a00" strokeWidth="2" />
    </svg>
  );
}

/** Explosión de fuegos artificiales de caramelo. */
function Firework({ hue = '#ff6b35' }: { hue?: string }) {
  const rays = Array.from({ length: 12 }, (_, i) => (i * 360) / 12);
  return (
    <svg viewBox="0 0 110 110" className="h-full w-full">
      {rays.map((deg) => (
        <g key={deg} transform={`rotate(${deg} 55 55)`}>
          <line x1="55" y1="55" x2="55" y2="16" stroke={hue} strokeWidth="3.5" strokeLinecap="round" opacity="0.85" />
          <circle cx="55" cy="14" r="4" fill="#ffd166" />
        </g>
      ))}
      <circle cx="55" cy="55" r="9" fill="#fff6c9" />
    </svg>
  );
}

/** Hoja de té suelta. */
function TeaLeaf({ hue = '#8fbf6a' }: { hue?: string }) {
  return (
    <svg viewBox="0 0 60 40" className="h-full w-full">
      <path d="M4 32 Q20 2 56 8 Q46 36 4 32 Z" fill={hue} />
      <path d="M8 30 Q30 20 52 10" stroke="#fff" strokeWidth="2" fill="none" opacity="0.6" />
    </svg>
  );
}

/** Cañas de bambú con hojas. */
function Bamboo({ hue = '#5fae5a' }: { hue?: string }) {
  return (
    <svg viewBox="0 0 90 150" className="h-full w-full">
      <ellipse cx="45" cy="146" rx="28" ry="5" fill="#000" opacity="0.12" />
      {[22, 46, 68].map((x, i) => (
        <g key={x}>
          <rect x={x - 7} y={14 + i * 9} width="14" height={132 - i * 9} rx="7" fill={hue} />
          {[0, 1, 2, 3].map((s) => (
            <rect key={s} x={x - 8} y={44 + i * 9 + s * 26} width="16" height="4" rx="2" fill="#2f6f3a" opacity="0.7" />
          ))}
          <rect x={x - 4} y={18 + i * 9} width="4" height={120 - i * 9} rx="2" fill="#fff" opacity="0.28" />
        </g>
      ))}
      <path d="M28 40 Q4 28 10 52 Q26 56 28 40 Z" fill="#7fc97a" />
      <path d="M62 62 Q86 50 80 74 Q64 78 62 62 Z" fill="#7fc97a" />
      <path d="M34 92 Q12 84 18 106 Q32 108 34 92 Z" fill="#9ad693" />
    </svg>
  );
}

/** Panal de miel goteante. */
function Honeycomb({ hue = '#f0c04a' }: { hue?: string }) {
  const hex = 'M20 2 L34 10 L34 26 L20 34 L6 26 L6 10 Z';
  return (
    <svg viewBox="0 0 110 120" className="h-full w-full">
      {[
        [8, 6],
        [44, 6],
        [26, 32],
        [62, 32],
        [8, 58],
        [44, 58],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
          <path d={hex} fill={hue} stroke="#c98a00" strokeWidth="2.5" />
          <path d={hex} fill="#fff" opacity="0.22" transform="scale(0.62) translate(12 10)" />
        </g>
      ))}
      <path d="M36 92 Q38 108 46 112 Q54 108 52 92 Z" fill="#ffd166" opacity="0.9" />
      <circle cx="44" cy="116" r="5" fill="#ffd166" />
    </svg>
  );
}

/** Planeta boba con anillo de perlas. */
function Planet({ hue = '#8b7ae8' }: { hue?: string }) {
  return (
    <svg viewBox="0 0 120 110" className="h-full w-full">
      <circle cx="60" cy="54" r="34" fill={hue} />
      <circle cx="48" cy="42" r="11" fill="#fff" opacity="0.3" />
      <circle cx="74" cy="66" r="7" fill="#fff" opacity="0.18" />
      <ellipse cx="60" cy="58" rx="56" ry="15" fill="none" stroke="#ffd166" strokeWidth="5" opacity="0.85" transform="rotate(-18 60 58)" />
      {[18, 44, 78, 102].map((x, i) => (
        <circle key={x} cx={x} cy={58 - (i - 1.5) * 7} r="4.5" fill="#3b2a24" />
      ))}
      <path d="M100 14 L103 22 L111 25 L103 28 L100 36 L97 28 L89 25 L97 22 Z" fill="#fff6c9" />
    </svg>
  );
}

/** Volcán de caramelo en erupción. */
function Volcano({ hue = '#e06a46' }: { hue?: string }) {
  return (
    <svg viewBox="0 0 150 130" className="h-full w-full">
      <ellipse cx="75" cy="124" rx="56" ry="6" fill="#000" opacity="0.14" />
      <path d="M14 122 L54 40 H96 L136 122 Z" fill={hue} stroke="#a93a22" strokeWidth="3" />
      <path d="M54 40 H96 L108 64 Q75 78 42 64 Z" fill="#8c2f1c" opacity="0.5" />
      <path d="M52 44 Q62 70 48 96 Q70 86 76 112" stroke="#ffb703" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M98 46 Q92 72 106 98" stroke="#ff8500" strokeWidth="6" fill="none" strokeLinecap="round" />
      <ellipse cx="75" cy="40" rx="22" ry="7" fill="#ffd166" />
      <path d="M62 30 Q66 10 75 2 Q84 12 88 30 Q75 22 62 30 Z" fill="#ff6b35" />
      <circle cx="58" cy="14" r="5" fill="#ffd166" opacity="0.9" />
      <circle cx="96" cy="20" r="4" fill="#ffb703" opacity="0.85" />
    </svg>
  );
}

/** Árbol frutal tropical cargado de mangos. */
function FruitTree({ hue = '#94cf5c' }: { hue?: string }) {
  return (
    <svg viewBox="0 0 140 150" className="h-full w-full">
      <ellipse cx="70" cy="144" rx="34" ry="6" fill="#000" opacity="0.12" />
      <path d="M68 148 L68 88 Q60 74 46 70" stroke="#8a6245" strokeWidth="10" strokeLinecap="round" fill="none" />
      <circle cx="46" cy="58" r="27" fill={hue} />
      <circle cx="92" cy="52" r="31" fill="#a8dd6e" />
      <circle cx="70" cy="34" r="26" fill="#86c44f" />
      <circle cx="102" cy="80" r="21" fill="#9ed463" />
      <circle cx="40" cy="86" r="18" fill="#a8dd6e" />
      <ellipse cx="54" cy="74" rx="9" ry="11" fill="#ffb703" />
      <ellipse cx="96" cy="68" rx="8" ry="10" fill="#ff9f1c" />
      <ellipse cx="78" cy="94" rx="8" ry="10" fill="#ffd166" />
      <ellipse cx="50" cy="48" rx="7" ry="9" fill="#ff8fb1" />
    </svg>
  );
}

/** Cristal de azúcar de cueva. */
function SugarCrystal({ hue = '#7ea8e0' }: { hue?: string }) {
  return (
    <svg viewBox="0 0 100 130" className="h-full w-full">
      <ellipse cx="50" cy="124" rx="34" ry="6" fill="#000" opacity="0.12" />
      <path d="M50 6 L74 56 L62 122 H38 L26 56 Z" fill={hue} stroke="#fff" strokeWidth="3" />
      <path d="M50 6 L74 56 L50 70 Z" fill="#fff" opacity="0.4" />
      <path d="M50 70 L62 122 H50 Z" fill="#fff" opacity="0.22" />
      <path d="M18 60 L30 90 L22 122 H10 L6 88 Z" fill={hue} stroke="#fff" strokeWidth="2.5" opacity="0.85" />
      <path d="M82 66 L94 94 L88 122 H76 L72 92 Z" fill={hue} stroke="#fff" strokeWidth="2.5" opacity="0.85" />
      <circle cx="50" cy="44" r="5" fill="#fff" opacity="0.8" />
    </svg>
  );
}

/** Isla flotante de nube con foam. */
function CloudIsland({ hue = '#b9ddf5' }: { hue?: string }) {
  return (
    <svg viewBox="0 0 150 110" className="h-full w-full">
      <ellipse cx="42" cy="56" rx="34" ry="24" fill="#fff" />
      <ellipse cx="86" cy="46" rx="40" ry="28" fill="#fff" />
      <ellipse cx="116" cy="62" rx="28" ry="20" fill="#fff" />
      <path d="M14 62 Q40 92 75 90 Q112 88 136 64 Q110 80 75 80 Q40 80 14 62 Z" fill={hue} opacity="0.85" />
      <ellipse cx="70" cy="40" rx="18" ry="11" fill="#fff" opacity="0.9" />
      <circle cx="56" cy="34" r="5" fill="#ffd166" opacity="0.75" />
      <circle cx="104" cy="32" r="4" fill="#ff8fb1" opacity="0.7" />
    </svg>
  );
}

/** Carpa de carnaval a rayas. */
function CircusTent({ hue = '#f07aa8' }: { hue?: string }) {
  return (
    <svg viewBox="0 0 150 140" className="h-full w-full">
      <ellipse cx="75" cy="134" rx="56" ry="6" fill="#000" opacity="0.13" />
      <path d="M75 6 L75 24" stroke="#c98a00" strokeWidth="4" />
      <path d="M75 4 L96 12 L75 20 Z" fill="#ffd166" />
      <path d="M12 76 Q75 10 138 76 Z" fill={hue} />
      {[0, 1, 2, 3].map((i) => (
        <path
          key={i}
          d={`M${30 + i * 30} 76 Q75 16 75 16 Q75 16 ${36 + i * 30} 76 Z`}
          fill="#fffdf7"
          opacity="0.55"
        />
      ))}
      <rect x="18" y="74" width="114" height="54" rx="8" fill="#fffdf7" stroke={hue} strokeWidth="3" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={24 + i * 22} y="78" width="11" height="46" rx="4" fill={hue} opacity="0.55" />
      ))}
      <path d="M58 128 L58 92 Q75 78 92 92 L92 128 Z" fill="#ffd166" stroke="#c98a00" strokeWidth="2" />
    </svg>
  );
}

/** Arco de aurora boreal. */
function AuroraArc({ hue = '#63c9bb' }: { hue?: string }) {
  return (
    <svg viewBox="0 0 170 120" className="h-full w-full">
      {[0, 1, 2, 3].map((i) => (
        <path
          key={i}
          d={`M6 ${106 - i * 6} Q85 ${10 + i * 14} 164 ${106 - i * 6}`}
          stroke={[hue, '#8fd3f4', '#b9a4f0', '#ffd1f0'][i]}
          strokeWidth={11 - i * 1.6}
          fill="none"
          strokeLinecap="round"
          opacity={0.72 - i * 0.12}
        />
      ))}
      <circle cx="36" cy="30" r="3.5" fill="#fff" />
      <circle cx="132" cy="22" r="3" fill="#fff" />
      <circle cx="84" cy="14" r="2.5" fill="#fff" />
      <path d="M150 44 L152 51 L159 53 L152 55 L150 62 L148 55 L141 53 L148 51 Z" fill="#fff6c9" />
    </svg>
  );
}

/** Trono dorado del palacio. */
function Throne({ hue = '#edc85e' }: { hue?: string }) {
  return (
    <svg viewBox="0 0 130 150" className="h-full w-full">
      <ellipse cx="65" cy="144" rx="46" ry="6" fill="#000" opacity="0.14" />
      <path d="M28 54 Q34 18 44 46 Q52 10 65 42 Q78 10 86 46 Q96 18 102 54 Z" fill={hue} stroke="#b1870d" strokeWidth="2.5" />
      <rect x="28" y="52" width="74" height="60" rx="10" fill="#f6e3cd" stroke="#b1870d" strokeWidth="3" />
      <rect x="38" y="62" width="54" height="42" rx="8" fill="#e0517d" opacity="0.8" />
      <rect x="18" y="86" width="16" height="42" rx="7" fill={hue} stroke="#b1870d" strokeWidth="2.5" />
      <rect x="96" y="86" width="16" height="42" rx="7" fill={hue} stroke="#b1870d" strokeWidth="2.5" />
      <rect x="32" y="110" width="66" height="22" rx="8" fill={hue} stroke="#b1870d" strokeWidth="2.5" />
      <circle cx="44" cy="40" r="5" fill="#fff6c9" />
      <circle cx="65" cy="34" r="6" fill="#fff6c9" />
      <circle cx="86" cy="40" r="5" fill="#fff6c9" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*                         Composición de cada región                         */
/* -------------------------------------------------------------------------- */

interface Decoration {
  /** Posición horizontal en % (la columna de juego ocupa el centro). */
  left: number;
  /** Posición vertical en % dentro de la banda de la zona. */
  top: number;
  /** Ancho en px. */
  size: number;
  node: React.ReactNode;
  /** Clase de animación suave. */
  anim?: string;
  delay?: number;
  opacity?: number;
}

/** Confeti ambiental determinista: puntos de color que llenan los márgenes. */
function ambientSparks(zone: number, accent: string): Decoration[] {
  const palette = [accent, '#ffd166', '#ff8fb1', '#ffffff', '#b9a4f0', '#8fbf6a'];
  return Array.from({ length: 24 }, (_, i) => {
    const seed = zone * 31 + i * 17;
    const onLeft = i % 2 === 0;
    const lane = (seed % 13) * 0.9;
    const size = 8 + (seed % 4) * 5;
    return {
      left: onLeft ? 1 + lane : 99 - lane - size / 10,
      top: ((seed * 7) % 94) + 2,
      size,
      opacity: 0.5 + ((seed % 4) * 0.12),
      anim: i % 3 === 0 ? 'map-twinkle' : i % 3 === 1 ? 'map-float' : 'map-bob',
      delay: (seed % 20) * 0.17,
      node: (
        <svg viewBox="0 0 20 20" className="h-full w-full">
          <circle cx="10" cy="10" r="8" fill={palette[seed % palette.length]} />
          <circle cx="7" cy="7" r="2.6" fill="#fff" opacity="0.75" />
        </svg>
      ),
    };
  });
}

function decorationsFor(scene: SceneKind): Decoration[] {
  switch (scene) {
    case 'tea':
      return [
        { left: 2, top: 8, size: 92, node: <TeaPot />, anim: 'map-float', opacity: 0.85 },
        { left: 82, top: 18, size: 64, node: <PearlJar />, anim: 'map-bob', delay: 0.6 },
        { left: 4, top: 42, size: 70, node: <BobaCup hue="#d7a878" lid="#a9744a" />, anim: 'map-bob', delay: 1.2 },
        { left: 84, top: 54, size: 58, node: <TeaLeaf />, anim: 'map-sway', delay: 0.3, opacity: 0.8 },
        { left: 1, top: 74, size: 76, node: <PearlJar hue="#7a4a2a" />, anim: 'map-float', delay: 1.8 },
        { left: 83, top: 84, size: 72, node: <BobaCup hue="#ffd9a0" lid="#c9843f" />, anim: 'map-bob', delay: 0.9 },
      ];
    case 'sakura':
      return [
        { left: 0, top: 6, size: 118, node: <SakuraTree />, anim: 'map-sway', opacity: 0.9 },
        { left: 82, top: 22, size: 72, node: <BobaCup hue="#b8e6a4" lid="#4f8f4a" />, anim: 'map-bob', delay: 0.5 },
        { left: 85, top: 48, size: 52, node: <TeaLeaf hue="#6fae53" />, anim: 'map-sway', delay: 1.1 },
        { left: 2, top: 58, size: 104, node: <SakuraTree />, anim: 'map-sway', delay: 1.6, opacity: 0.8 },
        { left: 81, top: 72, size: 80, node: <TeaPot />, anim: 'map-float', delay: 0.8 },
        { left: 6, top: 90, size: 56, node: <TeaLeaf hue="#a8d98a" />, anim: 'map-sway', delay: 2 },
      ];
    case 'tiger':
      return [
        { left: 80, top: 8, size: 86, node: <BobaCup hue="#d79a4f" lid="#6b3004" />, anim: 'map-bob' },
        { left: 2, top: 20, size: 78, node: <PearlJar hue="#6b3004" />, anim: 'map-float', delay: 0.7 },
        { left: 83, top: 40, size: 62, node: <Firework hue="#ff9f1c" />, anim: 'map-twinkle', delay: 0.4, opacity: 0.75 },
        { left: 1, top: 56, size: 92, node: <TeaPot />, anim: 'map-float', delay: 1.4 },
        { left: 82, top: 70, size: 84, node: <BobaCup hue="#c9772a" lid="#8b4513" />, anim: 'map-bob', delay: 1 },
        { left: 4, top: 88, size: 66, node: <CookieJar />, anim: 'map-bob', delay: 1.8 },
      ];
    case 'taro':
      return [
        { left: 2, top: 10, size: 74, node: <CookieJar />, anim: 'map-bob' },
        { left: 83, top: 16, size: 60, node: <Firework hue="#d8b4f8" />, anim: 'map-twinkle', delay: 0.5, opacity: 0.8 },
        { left: 81, top: 40, size: 84, node: <BobaCup hue="#d8b4f8" lid="#7d62c9" />, anim: 'map-bob', delay: 1.1 },
        { left: 1, top: 52, size: 70, node: <PearlJar hue="#4a2a6b" />, anim: 'map-float', delay: 0.9 },
        { left: 84, top: 72, size: 56, node: <Firework hue="#ffd166" />, anim: 'map-twinkle', delay: 1.5, opacity: 0.7 },
        { left: 3, top: 86, size: 78, node: <CookieJar />, anim: 'map-float', delay: 1.7 },
      ];
    case 'lab':
      return [
        { left: 1, top: 8, size: 84, node: <Flask hue="#ffd166" />, anim: 'map-bob' },
        { left: 82, top: 20, size: 76, node: <Flask hue="#8fd3f4" />, anim: 'map-bob', delay: 0.8 },
        { left: 3, top: 42, size: 64, node: <IceCrystal hue="#e0d4ff" />, anim: 'map-twinkle', delay: 0.4 },
        { left: 84, top: 54, size: 88, node: <Flask hue="#ffb7c9" />, anim: 'map-float', delay: 1.3 },
        { left: 2, top: 74, size: 92, node: <TeaPot />, anim: 'map-float', delay: 1.9 },
        { left: 83, top: 88, size: 62, node: <Firework hue="#ffd166" />, anim: 'map-twinkle', delay: 0.6 },
      ];
    case 'market':
      return [
        { left: 0, top: 6, size: 128, node: <MarketStall hue="#e0517d" />, anim: 'map-float', opacity: 0.9 },
        { left: 85, top: 12, size: 52, node: <Lantern hue="#e0517d" />, anim: 'map-sway', delay: 0.3 },
        { left: 86, top: 34, size: 46, node: <Lantern hue="#ff9f1c" />, anim: 'map-sway', delay: 0.9 },
        { left: 2, top: 48, size: 50, node: <Lantern hue="#ffd166" />, anim: 'map-sway', delay: 1.4 },
        { left: 80, top: 58, size: 120, node: <MarketStall hue="#9655d9" />, anim: 'map-float', delay: 1.1, opacity: 0.85 },
        { left: 3, top: 76, size: 48, node: <Lantern hue="#e0517d" />, anim: 'map-sway', delay: 0.6 },
        { left: 84, top: 88, size: 72, node: <BobaCup hue="#ffb7c9" lid="#e0517d" />, anim: 'map-bob', delay: 1.6 },
      ];
    case 'coast':
      return [
        { left: 0, top: 10, size: 132, node: <Wave />, anim: 'map-sway', opacity: 0.8 },
        { left: 82, top: 22, size: 78, node: <BobaCup hue="#bfe9ff" lid="#2e8bc0" />, anim: 'map-bob', delay: 0.5 },
        { left: 80, top: 44, size: 130, node: <Wave hue="#a8e0f7" />, anim: 'map-sway', delay: 1, opacity: 0.75 },
        { left: 1, top: 56, size: 72, node: <BobaCup hue="#ffe9a8" lid="#d99014" />, anim: 'map-bob', delay: 1.4 },
        { left: 0, top: 80, size: 128, node: <Wave hue="#8fd3f4" />, anim: 'map-sway', delay: 0.7, opacity: 0.8 },
        { left: 84, top: 86, size: 58, node: <TeaLeaf hue="#ffd166" />, anim: 'map-sway', delay: 1.9 },
      ];
    case 'ice':
      return [
        { left: 2, top: 8, size: 82, node: <IceCrystal />, anim: 'map-twinkle' },
        { left: 83, top: 18, size: 66, node: <IceCrystal hue="#dff3ff" />, anim: 'map-float', delay: 0.7 },
        { left: 1, top: 38, size: 94, node: <IceCrystal hue="#cfeaff" />, anim: 'map-float', delay: 1.2 },
        { left: 82, top: 52, size: 78, node: <BobaCup hue="#dff3ff" lid="#5aa9d6" />, anim: 'map-bob', delay: 0.4 },
        { left: 3, top: 72, size: 70, node: <IceCrystal />, anim: 'map-twinkle', delay: 1.6 },
        { left: 84, top: 86, size: 88, node: <IceCrystal hue="#bfe9ff" />, anim: 'map-float', delay: 2 },
      ];
    case 'fireworks':
      return [
        { left: 2, top: 6, size: 86, node: <Firework hue="#ff6b35" />, anim: 'map-twinkle' },
        { left: 82, top: 14, size: 74, node: <Firework hue="#ffd166" />, anim: 'map-twinkle', delay: 0.5 },
        { left: 1, top: 34, size: 68, node: <Firework hue="#ff8fb1" />, anim: 'map-twinkle', delay: 1 },
        { left: 83, top: 46, size: 90, node: <BobaCup hue="#ff9f6b" lid="#ff6b35" />, anim: 'map-bob', delay: 0.8 },
        { left: 2, top: 64, size: 92, node: <Firework hue="#ffb703" />, anim: 'map-twinkle', delay: 1.5 },
        { left: 81, top: 78, size: 78, node: <Firework hue="#e0517d" />, anim: 'map-twinkle', delay: 0.3 },
        { left: 4, top: 90, size: 64, node: <Lantern hue="#ff6b35" />, anim: 'map-sway', delay: 1.8 },
      ];
    case 'bamboo':
      return [
        { left: 0, top: 6, size: 112, node: <Bamboo />, anim: 'map-sway' },
        { left: 83, top: 18, size: 70, node: <BobaCup hue="#c9ee9b" lid="#3f8f5c" />, anim: 'map-bob', delay: 0.6 },
        { left: 2, top: 44, size: 60, node: <TeaLeaf hue="#6fae53" />, anim: 'map-sway', delay: 1.2 },
        { left: 81, top: 56, size: 104, node: <Bamboo hue="#4f9f54" />, anim: 'map-sway', delay: 0.9 },
        { left: 1, top: 74, size: 86, node: <TeaPot />, anim: 'map-float', delay: 1.6 },
        { left: 84, top: 88, size: 58, node: <TeaLeaf hue="#9ad693" />, anim: 'map-sway', delay: 2 },
      ];
    case 'honey':
      return [
        { left: 2, top: 8, size: 88, node: <Honeycomb />, anim: 'map-float' },
        { left: 82, top: 20, size: 74, node: <BobaCup hue="#ffd166" lid="#e0a100" />, anim: 'map-bob', delay: 0.7 },
        { left: 1, top: 42, size: 70, node: <Honeycomb hue="#ffdd8a" />, anim: 'map-bob', delay: 1.3 },
        { left: 84, top: 54, size: 62, node: <TeaLeaf hue="#f0c04a" />, anim: 'map-sway', delay: 0.4 },
        { left: 2, top: 72, size: 92, node: <PearlJar hue="#8a5a00" />, anim: 'map-float', delay: 1.8 },
        { left: 82, top: 86, size: 80, node: <Honeycomb />, anim: 'map-twinkle', delay: 1 },
      ];
    case 'galaxy':
      return [
        { left: 1, top: 8, size: 104, node: <Planet />, anim: 'map-float' },
        { left: 83, top: 20, size: 64, node: <Firework hue="#b9a4f0" />, anim: 'map-twinkle', delay: 0.5 },
        { left: 2, top: 42, size: 70, node: <Firework hue="#ffd166" />, anim: 'map-twinkle', delay: 1.1 },
        { left: 81, top: 52, size: 96, node: <Planet hue="#6a5ae0" />, anim: 'map-float', delay: 0.8 },
        { left: 3, top: 74, size: 78, node: <BobaCup hue="#cbb9ff" lid="#4a3a8a" />, anim: 'map-bob', delay: 1.5 },
        { left: 84, top: 88, size: 60, node: <Firework hue="#8fd3f4" />, anim: 'map-twinkle', delay: 1.9 },
      ];
    case 'volcano':
      return [
        { left: 0, top: 8, size: 124, node: <Volcano />, anim: 'map-bob' },
        { left: 84, top: 22, size: 62, node: <Firework hue="#ff6b35" />, anim: 'map-twinkle', delay: 0.5 },
        { left: 2, top: 46, size: 78, node: <BobaCup hue="#ff9f6b" lid="#a93a22" />, anim: 'map-bob', delay: 1 },
        { left: 80, top: 56, size: 116, node: <Volcano hue="#d9442f" />, anim: 'map-float', delay: 1.4 },
        { left: 3, top: 80, size: 70, node: <PearlJar hue="#6b3004" />, anim: 'map-float', delay: 1.8 },
        { left: 85, top: 90, size: 58, node: <Firework hue="#ffb703" />, anim: 'map-twinkle', delay: 0.8 },
      ];
    case 'orchard':
      return [
        { left: 0, top: 6, size: 118, node: <FruitTree />, anim: 'map-sway' },
        { left: 83, top: 20, size: 72, node: <BobaCup hue="#ffd23f" lid="#5fae3a" />, anim: 'map-bob', delay: 0.6 },
        { left: 2, top: 44, size: 56, node: <TeaLeaf hue="#86c44f" />, anim: 'map-sway', delay: 1.2 },
        { left: 80, top: 54, size: 110, node: <FruitTree hue="#a8dd6e" />, anim: 'map-sway', delay: 1 },
        { left: 1, top: 78, size: 82, node: <PearlJar hue="#e0a100" />, anim: 'map-float', delay: 1.6 },
        { left: 85, top: 90, size: 58, node: <TeaLeaf hue="#ffb703" />, anim: 'map-sway', delay: 2.1 },
      ];
    case 'cave':
      return [
        { left: 1, top: 8, size: 96, node: <SugarCrystal />, anim: 'map-twinkle' },
        { left: 84, top: 18, size: 68, node: <IceCrystal hue="#cfe0ff" />, anim: 'map-float', delay: 0.7 },
        { left: 2, top: 42, size: 84, node: <SugarCrystal hue="#9ab8e8" />, anim: 'map-float', delay: 1.3 },
        { left: 81, top: 54, size: 76, node: <BobaCup hue="#cfe0ff" lid="#4a8fd6" />, anim: 'map-bob', delay: 0.5 },
        { left: 3, top: 76, size: 70, node: <IceCrystal hue="#e0d4ff" />, anim: 'map-twinkle', delay: 1.7 },
        { left: 83, top: 88, size: 90, node: <SugarCrystal />, anim: 'map-float', delay: 2 },
      ];
    case 'sky':
      return [
        { left: 0, top: 8, size: 128, node: <CloudIsland />, anim: 'map-float' },
        { left: 83, top: 22, size: 74, node: <BobaCup hue="#dff3ff" lid="#59a8e8" />, anim: 'map-bob', delay: 0.6 },
        { left: 2, top: 44, size: 110, node: <CloudIsland hue="#d8ecff" />, anim: 'map-float', delay: 1.2 },
        { left: 85, top: 56, size: 56, node: <Firework hue="#ffd166" />, anim: 'map-twinkle', delay: 0.9 },
        { left: 1, top: 76, size: 118, node: <CloudIsland />, anim: 'map-sway', delay: 1.7 },
        { left: 84, top: 88, size: 66, node: <TeaLeaf hue="#b9ddf5" />, anim: 'map-sway', delay: 2.2 },
      ];
    case 'carnival':
      return [
        { left: 0, top: 6, size: 126, node: <CircusTent />, anim: 'map-float' },
        { left: 84, top: 20, size: 56, node: <Lantern hue="#e0417d" />, anim: 'map-sway', delay: 0.4 },
        { left: 2, top: 42, size: 68, node: <Firework hue="#ff8fb1" />, anim: 'map-twinkle', delay: 1 },
        { left: 80, top: 52, size: 118, node: <CircusTent hue="#b9a4f0" />, anim: 'map-float', delay: 1.4 },
        { left: 1, top: 76, size: 78, node: <BobaCup hue="#ffb7c9" lid="#e0417d" />, anim: 'map-bob', delay: 0.8 },
        { left: 85, top: 88, size: 60, node: <Lantern hue="#ffd166" />, anim: 'map-sway', delay: 1.9 },
      ];
    case 'aurora':
      return [
        { left: 0, top: 6, size: 136, node: <AuroraArc />, anim: 'map-sway', opacity: 0.85 },
        { left: 83, top: 22, size: 70, node: <IceCrystal hue="#cdeeff" />, anim: 'map-twinkle', delay: 0.6 },
        { left: 1, top: 44, size: 124, node: <AuroraArc hue="#8fd3f4" />, anim: 'map-sway', delay: 1.2, opacity: 0.8 },
        { left: 82, top: 56, size: 78, node: <BobaCup hue="#b7f0e4" lid="#2fae9e" />, anim: 'map-bob', delay: 0.9 },
        { left: 2, top: 78, size: 86, node: <IceCrystal hue="#dff3ff" />, anim: 'map-float', delay: 1.6 },
        { left: 84, top: 90, size: 62, node: <Firework hue="#63c9bb" />, anim: 'map-twinkle', delay: 2 },
      ];
    case 'royal':
      return [
        { left: 0, top: 6, size: 122, node: <Throne />, anim: 'map-float' },
        { left: 84, top: 20, size: 58, node: <Lantern hue="#ffd166" />, anim: 'map-sway', delay: 0.5 },
        { left: 2, top: 40, size: 108, node: <Pagoda hue="#edc85e" />, anim: 'map-float', delay: 1.1 },
        { left: 82, top: 54, size: 82, node: <BobaCup hue="#ffe9a8" lid="#c99a0e" />, anim: 'map-bob', delay: 0.8 },
        { left: 1, top: 76, size: 114, node: <Throne hue="#f5d87a" />, anim: 'map-float', delay: 1.6, opacity: 0.9 },
        { left: 85, top: 88, size: 64, node: <Firework hue="#ffd166" />, anim: 'map-twinkle', delay: 1.3 },
      ];
    case 'temple':
    default:
      return [
        { left: 0, top: 6, size: 124, node: <Pagoda />, anim: 'map-float', opacity: 0.92 },
        { left: 84, top: 20, size: 56, node: <Lantern hue="#ffd166" />, anim: 'map-sway', delay: 0.6 },
        { left: 82, top: 38, size: 88, node: <Flask hue="#ffd166" />, anim: 'map-bob', delay: 1.1 },
        { left: 2, top: 54, size: 72, node: <BobaCup hue="#ffe9a8" lid="#c08a1e" />, anim: 'map-bob', delay: 0.9 },
        { left: 80, top: 66, size: 116, node: <Pagoda hue="#d9a93f" />, anim: 'map-float', delay: 1.7, opacity: 0.85 },
        { left: 3, top: 84, size: 66, node: <Firework hue="#ffd166" />, anim: 'map-twinkle', delay: 1.3 },
      ];
  }
}

/* -------------------------------------------------------------------------- */
/*                          Banda completa de la zona                         */
/* -------------------------------------------------------------------------- */

interface ZoneSceneProps {
  zone: ZoneInfo;
  /** Posición vertical absoluta de la banda dentro del mapa (px). */
  top: number;
  /** Altura de la banda (px). */
  height: number;
  /** Zona ya alcanzada por el jugador: se ve viva y saturada. */
  reached: boolean;
}

/** Fondo ilustrado de una región completa del mapa. */
export const ZoneScene = memo(function ZoneScene({ zone, top, height, reached }: ZoneSceneProps) {
  const base = decorationsFor(zone.scene);
  // Segunda pasada desplazada: duplica la densidad sin repetir la composición.
  const decor = [
    ...base,
    ...base.map((d) => ({
      ...d,
      top: ((d.top + 47) % 90) + 5,
      left: d.left > 50 ? Math.min(97, d.left + 4) : Math.max(0, d.left - 1),
      size: Math.round(d.size * 0.78),
      delay: (d.delay ?? 0) + 1.3,
      opacity: (d.opacity ?? 0.95) * 0.88,
    })),
  ];
  const sparks = ambientSparks(zone.id, zone.accent);

  return (
    <div
      className="pointer-events-none absolute inset-x-0 select-none"
      style={{ top, height }}
      aria-hidden="true"
    >
      {/* Cielo de la región, fundido arriba y abajo para que no se vean costuras */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${zone.sky[0]} 0%, ${zone.sky[1]} 100%)`,
          opacity: reached ? 1 : 0.82,
          maskImage: 'linear-gradient(to bottom, transparent 0%, #000 7%, #000 93%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, #000 7%, #000 93%, transparent 100%)',
        }}
      />

      {/* Halos de color que dan profundidad */}
      <div
        className="absolute left-[-10%] top-[6%] h-[40%] w-[55%] rounded-full blur-3xl"
        style={{ background: zone.accent, opacity: reached ? 0.3 : 0.16 }}
      />
      <div
        className="absolute right-[-12%] top-[42%] h-[42%] w-[55%] rounded-full blur-3xl"
        style={{ background: zone.ground, opacity: reached ? 0.34 : 0.18 }}
      />

      {/* Nubes suaves que dan atmósfera a toda la franja */}
      {[10, 30, 52, 74, 92].map((cloudTop, i) => (
        <svg
          key={`cloud-${i}`}
          className={`absolute w-[60%] ${i % 2 === 0 ? 'left-[-10%]' : 'right-[-10%]'} ${i % 2 === 0 ? 'map-float' : 'map-sway'}`}
          style={{
            top: `${cloudTop}%`,
            opacity: reached ? 0.42 : 0.26,
            animationDelay: `${i * 1.4}s`,
            filter: 'blur(1px)',
          }}
          viewBox="0 0 300 80"
        >
          <ellipse cx="80" cy="50" rx="78" ry="26" fill="#fff" />
          <ellipse cx="150" cy="38" rx="62" ry="30" fill="#fff" />
          <ellipse cx="214" cy="52" rx="66" ry="24" fill="#fff" />
        </svg>
      ))}

      {/* Motivo gigante translúcido detrás del camino: llena el centro con carácter */}
      {[22, 62].map((wTop, i) => (
        <div
          key={`mark-${i}`}
          className={i % 2 === 0 ? 'map-float' : 'map-bob'}
          style={{
            position: 'absolute',
            top: `${wTop}%`,
            left: i % 2 === 0 ? '18%' : '46%',
            width: 'clamp(150px, 34vw, 320px)',
            aspectRatio: '1 / 1.2',
            opacity: reached ? 0.16 : 0.1,
            animationDelay: `${i * 2.2}s`,
          }}
        >
          {i % 2 === 0 ? <BobaCup hue={zone.accent} lid={zone.ground} /> : <Lantern hue={zone.accent} />}
        </div>
      ))}

      {/* Colinas / islas repetidas: profundidad a lo largo de toda la región */}
      {[26, 58, 100].map((pos, layer) => (
        <svg
          key={`hills-${layer}`}
          className="absolute inset-x-0 w-full"
          style={{
            top: `${pos}%`,
            height: '30%',
            transform: 'translateY(-100%)',
            opacity: layer === 2 ? 1 : 0.55,
            // Se desvanece hacia abajo para que no quede un borde recto.
            maskImage: 'linear-gradient(to bottom, #000 0%, #000 42%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, #000 42%, transparent 100%)',
          }}
          viewBox="0 0 400 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0 54 Q70 14 150 48 Q240 84 320 40 Q370 16 400 44 L400 120 L0 120 Z"
            fill={zone.ground}
            opacity={reached ? 0.45 : 0.28}
          />
          <path
            d="M0 80 Q90 46 180 76 Q270 106 400 70 L400 120 L0 120 Z"
            fill={zone.ground}
            opacity={reached ? 0.72 : 0.42}
          />
          <path
            d="M0 80 Q90 46 180 76 Q270 106 400 70"
            stroke="#fff"
            strokeWidth="4"
            fill="none"
            opacity={reached ? 0.7 : 0.38}
          />
        </svg>
      ))}

      {/* Confeti ambiental de la región */}
      {sparks.map((d, i) => (
        <div
          key={`spark-${i}`}
          className={`absolute ${d.anim ?? ''}`}
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            opacity: (d.opacity ?? 0.6) * (reached ? 1 : 0.55),
            animationDelay: `${d.delay ?? 0}s`,
          }}
        >
          {d.node}
        </div>
      ))}

      {/* Props ilustrados de la región (siempre fuera de la columna de juego) */}
      {decor.map((d, i) => {
        const lane = d.left > 50 ? Math.max(82, d.left) : Math.min(14, d.left);
        // Encogen en móvil y alcanzan su tamaño completo en pantallas anchas.
        const width = `clamp(${Math.round(d.size * 0.58)}px, ${(d.size / 12).toFixed(2)}vw, ${d.size}px)`;
        return (
          <div
            key={i}
            className={`absolute ${d.anim ?? ''}`}
            style={{
              left: `${lane}%`,
              top: `${d.top}%`,
              width,
              aspectRatio: '1 / 1.15',
              opacity: (d.opacity ?? 0.95) * (reached ? 1 : 0.78),
              animationDelay: `${d.delay ?? 0}s`,
              filter: reached
                ? 'drop-shadow(0 6px 10px rgba(59,42,36,0.18))'
                : 'saturate(0.8) drop-shadow(0 6px 10px rgba(59,42,36,0.12))',
            }}
          >
            {d.node}
          </div>
        );
      })}
    </div>
  );
});
