import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Coins, Lock, Star, Volume2, VolumeX } from 'lucide-react';
import { LEVEL_COUNT } from '../game/constants';
import { ZONES, zoneOf } from '../game/levels';
import type { SaveData } from '../game/storage';

interface MapScreenProps {
  save: SaveData;
  onBack: () => void;
  onPlay: (levelId: number) => void;
  onToggleSound: () => void;
}

const SPACING = 124;
/** Hueco extra antes de cada zona nueva, para que quepa su cartel. */
const ZONE_GAP = 120;
const TOP_PAD = 150;
const BOTTOM_PAD = 110;

/** Posición horizontal (%) del nodo i: un zigzag suave. */
function nodeX(index: number): number {
  return 50 + 26 * Math.sin(index * 0.9 + 0.4);
}

/** Número de huecos de zona acumulados hasta el índice i (sin contar la primera zona). */
function zoneGapsUpTo(index: number): number {
  return ZONES.filter((z) => z.from - 1 > 0 && z.from - 1 <= index).length;
}

/** Posición vertical en px desde la parte superior del mapa (nivel 1 abajo). */
function nodeY(index: number, height: number): number {
  return height - BOTTOM_PAD - index * SPACING - zoneGapsUpTo(index) * ZONE_GAP;
}

export function MapScreen({ save, onBack, onPlay, onToggleSound }: MapScreenProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const height =
    TOP_PAD + BOTTOM_PAD + (LEVEL_COUNT - 1) * SPACING + (ZONES.length - 1) * ZONE_GAP + 60;

  const starsOf = (id: number): number => save.stars[String(id)] ?? 0;
  const isUnlocked = (id: number): boolean => id === 1 || starsOf(id - 1) > 0 || starsOf(id) > 0;

  let current = 1;
  for (let id = 1; id <= LEVEL_COUNT; id++) {
    if (isUnlocked(id)) current = id;
  }
  const totalStars = Object.values(save.stars).reduce((s, v) => s + v, 0);

  // Centra el mapa en el pedido actual al entrar.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const target = nodeY(current - 1, height);
    el.scrollTop = Math.max(0, target - el.clientHeight * 0.6);
  }, [current, height]);

  // Segmentos del camino entre nodos consecutivos.
  const segments: string[] = [];
  for (let i = 0; i < LEVEL_COUNT - 1; i++) {
    const x0 = nodeX(i);
    const y0 = nodeY(i, height);
    const x1 = nodeX(i + 1);
    const y1 = nodeY(i + 1, height);
    const ym = (y0 + y1) / 2;
    segments.push(`M ${x0} ${y0} C ${x0} ${ym}, ${x1} ${ym}, ${x1} ${y1}`);
  }

  return (
    <div className="flex h-full w-full flex-col">
      <header className="z-10 flex items-center gap-2 px-3 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
        <button
          type="button"
          onClick={onBack}
          className="flex h-11 items-center gap-1.5 rounded-full border-2 border-white bg-white/85 px-4 font-extrabold text-[#5b44a8] shadow active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" /> Inicio
        </button>
        <div className="min-w-0 flex-1 text-center">
          <h1 className="font-display text-2xl font-black leading-none text-[#5b44a8] sm:text-3xl">Tienda</h1>
          <p className="truncate text-[11px] font-bold uppercase tracking-wider text-[#7a6a8a]">
            {ZONES[zoneOf(current)]?.name} · Pedido #{current}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="hidden items-center gap-1 rounded-full bg-[#eaf7dc] px-2.5 py-1.5 text-sm font-extrabold text-[#3f7a3a] sm:flex">
            <Star className="h-4 w-4 fill-[#ffd166] stroke-[#c98a00]" /> {totalStars}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-[#fff4cf] px-2.5 py-1.5 text-sm font-extrabold text-[#8a5a00]">
            <Coins className="h-4 w-4" /> {save.totalTips.toLocaleString('es-ES')}
          </span>
          <button
            type="button"
            onClick={onToggleSound}
            aria-label={save.soundOn ? 'Silenciar' : 'Activar sonido'}
            className="grid h-11 w-11 place-items-center rounded-full border-2 border-white bg-white/85 text-[#5b44a8] shadow active:scale-90 [&>svg]:h-[62%] [&>svg]:w-[62%]"
          >
            {save.soundOn ? <Volume2 /> : <VolumeX />}
          </button>
        </div>
      </header>

      <div ref={scrollRef} className="scroll-soft relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
        <div className="relative mx-auto w-full max-w-[520px]" style={{ height }}>
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox={`0 0 100 ${height}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {segments.map((d, i) => {
              const done = starsOf(i + 1) > 0;
              return (
                <path
                  key={i}
                  d={d}
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                  strokeWidth={done ? 6 : 4}
                  strokeLinecap="round"
                  strokeDasharray={done ? undefined : '2 10'}
                  className={done ? 'stroke-[#8fbf6a]' : 'stroke-[#b9a4f0]'}
                />
              );
            })}
          </svg>

          {ZONES.map((z) => {
            const idx = z.from - 1;
            const y = nodeY(idx, height) - 115;
            return (
              <div
                key={z.id}
                className="absolute left-1/2 w-[min(88%,380px)] -translate-x-1/2 rounded-3xl border-2 border-white bg-white/80 px-4 py-2 text-center shadow-md"
                style={{ top: y }}
              >
                <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#4f8f4a]">Zona {z.id + 1}</p>
                <p className="font-display text-lg font-black leading-tight text-[#5b44a8]">{z.name}</p>
                <p className="text-xs font-semibold text-[#7a6a8a]">{z.blurb}</p>
              </div>
            );
          })}

          {Array.from({ length: LEVEL_COUNT }, (_, i) => {
            const id = i + 1;
            const stars = starsOf(id);
            const unlocked = isUnlocked(id);
            const isCurrent = id === current;
            const x = nodeX(i);
            const y = nodeY(i, height);
            return (
              <motion.div
                key={id}
                className="absolute"
                style={{ left: `${x}%`, top: y, transform: 'translate(-50%, -50%)' }}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: Math.min(i * 0.02, 0.6), type: 'spring', stiffness: 300, damping: 20 }}
              >
                <button
                  type="button"
                  disabled={!unlocked}
                  onClick={() => onPlay(id)}
                  aria-label={`Pedido ${id}${stars ? `, ${stars} estrellas` : ''}${unlocked ? '' : ', bloqueado'}`}
                  className={`relative grid h-[58px] w-[58px] place-items-center rounded-full border-4 font-display text-xl font-black shadow-[0_8px_16px_-6px_rgba(59,42,36,0.35)] transition active:scale-90 sm:h-16 sm:w-16 ${
                    !unlocked
                      ? 'border-white bg-[#e9e3f2] text-[#a89cc0]'
                      : stars > 0
                        ? 'border-white bg-gradient-to-b from-[#b8e6a4] to-[#6fa964] text-white'
                        : 'border-white bg-gradient-to-b from-[#cbb9ff] to-[#8f72e0] text-white'
                  }`}
                >
                  {isCurrent && (
                    <span className="pointer-events-none absolute -inset-2 animate-ping rounded-full border-4 border-[#ffd166]/80" />
                  )}
                  {!unlocked ? <Lock className="h-5 w-5" /> : <span className="relative">{id}</span>}
                </button>
                {unlocked && (
                  <div className="absolute left-1/2 top-full mt-1 flex -translate-x-1/2 gap-0.5" aria-hidden="true">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`h-3.5 w-3.5 ${s <= stars ? 'fill-[#ffd166] stroke-[#c98a00]' : 'fill-white/80 stroke-[#c9bedb]'}`}
                        strokeWidth={2}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* Ratoncito decorativo al final del camino */}
          <div className="pointer-events-none absolute bottom-3 left-3 rounded-2xl bg-white/70 px-3 py-2 text-xs font-bold text-[#5b44a8] shadow sm:left-6">
            Sube por el camino para abrir nuevos pedidos
          </div>
        </div>
      </div>
    </div>
  );
}
