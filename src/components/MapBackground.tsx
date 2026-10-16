import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Fondo decorado y animado del mapa de la Tienda, estilo boba.
 * Perlas flotantes, vasitos de té, burbujas que suben y destellos.
 * Todo es decorativo: pointer-events none y respeta prefers-reduced-motion.
 */

interface Pearl {
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

interface Bubble {
  left: number;
  size: number;
  duration: number;
  delay: number;
}

interface CupSpot {
  left: number;
  top: number;
  size: number;
  tilt: number;
  duration: number;
  tint: string;
  straw: string;
}

interface Spark {
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
}

/** Pseudoaleatorio determinista: el fondo siempre se dibuja igual. */
function seeded(i: number, salt: number): number {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function BobaCup({ tint, straw, size }: { tint: string; straw: string; size: number }) {
  return (
    <svg viewBox="0 0 60 76" width={size} height={(size * 76) / 60} aria-hidden="true">
      {/* pajita */}
      <rect x="34" y="2" width="6" height="30" rx="3" fill={straw} transform="rotate(12 37 17)" />
      {/* tapa */}
      <rect x="8" y="22" width="44" height="7" rx="3.5" fill="#fff" opacity="0.95" />
      {/* vaso */}
      <path d="M12 29 L48 29 L44 68 Q43.6 72 39 72 L21 72 Q16.4 72 16 68 Z" fill={tint} opacity="0.85" />
      <path d="M12 29 L48 29 L47 38 L13 38 Z" fill="#fff" opacity="0.35" />
      {/* perlas */}
      <circle cx="24" cy="64" r="4" fill="#3a2317" />
      <circle cx="32" cy="66" r="4" fill="#3a2317" />
      <circle cx="39" cy="63" r="4" fill="#3a2317" />
      <circle cx="28" cy="58" r="4" fill="#3a2317" />
      <circle cx="36" cy="58" r="4" fill="#3a2317" />
      {/* brillo */}
      <rect x="17" y="34" width="4" height="22" rx="2" fill="#fff" opacity="0.5" />
    </svg>
  );
}

export function MapBackground({ height }: { height: number }) {
  const reduce = useReducedMotion();

  const pearls = useMemo<Pearl[]>(() => {
    const count = Math.min(42, Math.max(18, Math.floor(height / 220)));
    return Array.from({ length: count }, (_, i) => {
      const side = i % 2 === 0 ? 4 + seeded(i, 1) * 18 : 78 + seeded(i, 2) * 18;
      return {
        left: side,
        top: seeded(i, 3) * height,
        size: 10 + seeded(i, 4) * 16,
        duration: 3.5 + seeded(i, 5) * 3,
        delay: -seeded(i, 6) * 4,
        opacity: 0.35 + seeded(i, 7) * 0.4,
      };
    });
  }, [height]);

  const bubbles = useMemo<Bubble[]>(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        left: 6 + seeded(i, 11) * 88,
        size: 8 + seeded(i, 12) * 18,
        duration: 14 + seeded(i, 13) * 10,
        delay: -seeded(i, 14) * 18,
      })),
    [],
  );

  const cups = useMemo<CupSpot[]>(() => {
    const tints = ['#ffd9e3', '#cfe8c0', '#d9ccff', '#ffe9b8', '#cde4ff'];
    const straws = ['#ff8fb1', '#6fa964', '#8f72e0', '#f0a500', '#4aa3d9'];
    const count = Math.max(4, Math.floor(height / 1400));
    return Array.from({ length: count }, (_, i) => ({
      left: i % 2 === 0 ? 6 + seeded(i, 21) * 10 : 80 + seeded(i, 22) * 10,
      top: (height * (i + 0.7)) / (count + 0.4),
      size: 44 + seeded(i, 23) * 26,
      tilt: -10 + seeded(i, 24) * 20,
      duration: 4 + seeded(i, 25) * 3,
      tint: tints[i % tints.length] as string,
      straw: straws[i % straws.length] as string,
    }));
  }, [height]);

  const sparks = useMemo<Spark[]>(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        left: 4 + seeded(i, 31) * 92,
        top: seeded(i, 32) * height,
        size: 8 + seeded(i, 33) * 10,
        duration: 1.8 + seeded(i, 34) * 2.2,
        delay: -seeded(i, 35) * 3,
      })),
    [height],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Lavados de color por tramo del camino */}
      <div className="absolute left-[-20%] top-[6%] h-[26rem] w-[26rem] rounded-full bg-[#ffd6e0]/45 blur-3xl" />
      <div className="absolute right-[-20%] top-[30%] h-[28rem] w-[28rem] rounded-full bg-[#b8e6a4]/40 blur-3xl" />
      <div className="absolute left-[-20%] top-[55%] h-[28rem] w-[28rem] rounded-full bg-[#c9b6ff]/45 blur-3xl" />
      <div className="absolute right-[-20%] top-[80%] h-[26rem] w-[26rem] rounded-full bg-[#ffe9b8]/55 blur-3xl" />

      {/* Cinta crema bajo el camino */}
      <div className="absolute left-1/2 top-0 h-full w-[120px] -translate-x-1/2 rounded-full bg-[#fff7e6]/50 blur-2xl sm:w-[180px]" />

      {/* Perlas flotantes a los lados */}
      {pearls.map((p, i) =>
        reduce ? (
          <span
            key={`pearl${i}`}
            className="absolute rounded-full"
            style={{
              left: `${p.left}%`,
              top: p.top,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              background: 'radial-gradient(circle at 35% 30%, #7a5440, #2b1a10 70%)',
            }}
          />
        ) : (
          <motion.span
            key={`pearl${i}`}
            className="absolute rounded-full"
            style={{
              left: `${p.left}%`,
              top: p.top,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              background: 'radial-gradient(circle at 35% 30%, #7a5440, #2b1a10 70%)',
            }}
            animate={{ y: [0, -12, 0], x: [0, 5, 0] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ),
      )}

      {/* Vasitos de boba decorativos */}
      {cups.map((c, i) => (
        <motion.div
          key={`cup${i}`}
          className="absolute opacity-70"
          style={{ left: `${c.left}%`, top: c.top, rotate: c.tilt }}
          animate={reduce ? undefined : { y: [0, -10, 0] }}
          transition={{ duration: c.duration, repeat: Infinity, ease: 'easeInOut' }}
        >
          <BobaCup tint={c.tint} straw={c.straw} size={c.size} />
        </motion.div>
      ))}

      {/* Burbujas que suben por todo el mapa */}
      {!reduce &&
        bubbles.map((b, i) => (
          <motion.span
            key={`bub${i}`}
            className="absolute rounded-full border border-white/80 bg-white/30"
            style={{ left: `${b.left}%`, bottom: 0, width: b.size, height: b.size }}
            initial={{ y: '4vh', opacity: 0 }}
            animate={{ y: `-${height + 80}px`, opacity: [0, 0.7, 0.7, 0] }}
            transition={{ duration: b.duration, delay: b.delay, repeat: Infinity, ease: 'linear' }}
          />
        ))}

      {/* Destellos */}
      {sparks.map((s, i) => (
        <motion.span
          key={`spark${i}`}
          className="absolute text-[#ffd166]"
          style={{ left: `${s.left}%`, top: s.top }}
          animate={reduce ? undefined : { opacity: [0.2, 1, 0.2], scale: [0.7, 1.15, 0.7], rotate: [0, 25, 0] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg viewBox="0 0 20 20" width={s.size} height={s.size} fill="currentColor" aria-hidden="true">
            <path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" />
          </svg>
        </motion.span>
      ))}

      {/* Guirnalda de meta al final del camino */}
      <div className="absolute left-1/2 top-2 -translate-x-1/2 text-center">
        <p className="rounded-full border-2 border-white bg-[#ffd166]/90 px-4 py-1 text-xs font-black uppercase tracking-[0.2em] text-[#6b4700] shadow-lg">
          ¡Meta boba!
        </p>
      </div>
    </div>
  );
}
