import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Fondo decorativo: burbujas que suben y pétalos con deriva de brisa.
 * Está detrás de todo (pointer-events: none) y se detiene con reduced-motion.
 */
export function Background() {
  const reduce = useReducedMotion();

  const bubbles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        left: (i * 37) % 100,
        size: 10 + ((i * 13) % 26),
        duration: 16 + ((i * 7) % 10),
        delay: -((i * 1.9) % 16),
      })),
    [],
  );

  const petals = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        left: (i * 53) % 100,
        size: 9 + ((i * 11) % 8),
        duration: 20 + ((i * 5) % 9),
        delay: -((i * 2.6) % 20),
        hue: i % 3 === 0 ? '#ffb7c9' : i % 3 === 1 ? '#ffd9e3' : '#b9e0a5',
      })),
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute -left-24 -top-24 h-[28rem] w-[28rem] rounded-full bg-[#c9b6ff]/50 blur-3xl" />
      <div className="absolute -right-20 top-1/3 h-[24rem] w-[24rem] rounded-full bg-[#b8e6a4]/40 blur-3xl" />
      <div className="absolute bottom-[-6rem] left-1/3 h-[22rem] w-[22rem] rounded-full bg-[#ffd6e0]/50 blur-3xl" />

      {!reduce &&
        bubbles.map((b, i) => (
          <motion.span
            key={`b${i}`}
            className="absolute rounded-full border border-white/70 bg-white/25 shadow-[inset_0_0_8px_rgba(255,255,255,0.8)]"
            style={{ left: `${b.left}%`, width: b.size, height: b.size, bottom: 0 }}
            initial={{ y: '10vh', opacity: 0 }}
            animate={{ y: '-115vh', opacity: [0, 0.8, 0.8, 0] }}
            transition={{ duration: b.duration, delay: b.delay, repeat: Infinity, ease: 'linear' }}
          />
        ))}

      {!reduce &&
        petals.map((p, i) => (
          <motion.span
            key={`p${i}`}
            className="absolute rounded-[80%_0_80%_0] opacity-70"
            style={{ left: `${p.left}%`, top: 0, width: p.size, height: p.size * 0.7, background: p.hue }}
            initial={{ y: '-10vh', rotate: 0 }}
            animate={{ y: '110vh', rotate: 360, x: [0, 26, -18, 10, 0] }}
            transition={{
              y: { duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' },
              rotate: { duration: p.duration / 2, delay: p.delay, repeat: Infinity, ease: 'linear' },
              x: { duration: p.duration / 1.4, delay: p.delay, repeat: Infinity, ease: 'easeInOut' },
            }}
          />
        ))}
    </div>
  );
}
