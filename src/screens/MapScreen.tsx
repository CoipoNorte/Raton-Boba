import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ChefHat,
  Coins,
  CupSoda,
  Flower2,
  Lock,
  PartyPopper,
  Star,
  Trophy,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { LEVEL_COUNT } from '../game/constants';
import { ZONES, zoneOf } from '../game/levels';
import { MapBackground } from '../components/MapBackground';
import type { SaveData } from '../game/storage';

interface MapScreenProps {
  save: SaveData;
  onBack: () => void;
  onPlay: (levelId: number) => void;
  onToggleSound: () => void;
}

const SPACING = 124;
/**
 * Hueco extra entre la última burbuja de una zona y la primera de la siguiente.
 * El cartel de la zona vive dentro de ese hueco, debajo de su primer nodo.
 */
const ZONE_GAP = 260;
const TOP_PAD = 170;
/** Espacio bajo el pedido 1: cartel de la zona 1 + tarjeta de ayuda. */
const BOTTOM_PAD = 280;
/** Distancia del cartel de zona respecto al centro de su primer nodo. */
const BANNER_BELOW = 56;

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

const ZONE_STYLES = [
  { card: 'from-[#fff6d9] to-[#ffe9b8]', chip: 'bg-[#ffd166] text-[#6b4700]', Icon: CupSoda },
  { card: 'from-[#eefbdf] to-[#cde8b8]', chip: 'bg-[#8fbf6a] text-white', Icon: Flower2 },
  { card: 'from-[#efe8ff] to-[#d5c6ff]', chip: 'bg-[#8f72e0] text-white', Icon: ChefHat },
  { card: 'from-[#ffe9f0] to-[#ffd0de]', chip: 'bg-[#ff8fb1] text-white', Icon: PartyPopper },
] as const;

function isZoneFinal(id: number): boolean {
  return ZONES.some((z) => z.to === id);
}

export function MapScreen({ save, onBack, onPlay, onToggleSound }: MapScreenProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const height =
    TOP_PAD + BOTTOM_PAD + (LEVEL_COUNT - 1) * SPACING + (ZONES.length - 1) * ZONE_GAP + 60;

  const starsOf = (id: number): number => save.stars[String(id)] ?? 0;
  const isUnlocked = (id: number): boolean => id === 1 || starsOf(id - 1) > 0 || starsOf(id) > 0;

  let current = 1;
  let completed = 0;
  for (let id = 1; id <= LEVEL_COUNT; id++) {
    if (isUnlocked(id)) current = id;
    if (starsOf(id) > 0) completed++;
  }
  const totalStars = Object.values(save.stars).reduce((s, v) => s + v, 0);
  const progress = Math.round((completed / LEVEL_COUNT) * 100);

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
      <header className="z-10 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
        <div className="flex items-center gap-2">
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
        </div>
        {/* Progreso del camino */}
        <div className="mx-auto mt-2 flex w-full max-w-[520px] items-center gap-2" aria-label={`Progreso: ${completed} de ${LEVEL_COUNT} pedidos`}>
          <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full border border-white bg-white/70 shadow-inner">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#b9a4f0] via-[#8fbf6a] to-[#ffd166]"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 22 }}
            />
          </div>
          <span className="shrink-0 rounded-full bg-white/85 px-2 py-0.5 text-[11px] font-black tabular-nums text-[#5b44a8] shadow">
            {completed}/{LEVEL_COUNT} · {progress}%
          </span>
        </div>
      </header>

      <div ref={scrollRef} className="scroll-soft relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
        <div className="relative mx-auto w-full max-w-[520px]" style={{ height }}>
          <MapBackground height={height} />

          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox={`0 0 100 ${height}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="mapPath" gradientUnits="userSpaceOnUse" x1="0" y1={height} x2="0" y2="0">
                <stop offset="0%" stopColor="#f0a500" />
                <stop offset="30%" stopColor="#8fbf6a" />
                <stop offset="55%" stopColor="#7d62c9" />
                <stop offset="80%" stopColor="#ff8fb1" />
                <stop offset="100%" stopColor="#ffd166" />
              </linearGradient>
            </defs>
            {/* Halo crema bajo el camino */}
            {segments.map((d, i) => (
              <path
                key={`halo${i}`}
                d={d}
                fill="none"
                vectorEffect="non-scaling-stroke"
                strokeWidth={11}
                strokeLinecap="round"
                className="stroke-[#fff7e6]/80"
              />
            ))}
            {segments.map((d, i) => {
              const done = starsOf(i + 1) > 0;
              return done ? (
                <path
                  key={i}
                  d={d}
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                  strokeWidth={6}
                  strokeLinecap="round"
                  stroke="url(#mapPath)"
                />
              ) : (
                <path
                  key={i}
                  d={d}
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                  strokeWidth={4}
                  strokeLinecap="round"
                  strokeDasharray="2 10"
                  className="stroke-[#8f72e0]"
                />
              );
            })}
          </svg>

          {ZONES.map((z) => {
            const idx = z.from - 1;
            // El cartel va en el hueco de la zona, debajo de su primer nodo:
            // no toca ni las estrellas del nodo ni el trofeo de la zona anterior.
            const y = nodeY(idx, height) + BANNER_BELOW;
            const style = ZONE_STYLES[z.id % ZONE_STYLES.length] as (typeof ZONE_STYLES)[number];
            const ZoneIcon = style.Icon;
            return (
              <motion.div
                key={z.id}
                className={`absolute left-1/2 w-[min(88%,380px)] -translate-x-1/2 rounded-3xl border-2 border-white bg-gradient-to-br px-4 py-2.5 text-center shadow-lg ${style.card}`}
                style={{ top: y }}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              >
                <p className="flex items-center justify-center gap-1.5 text-[11px] font-black uppercase tracking-[0.25em] text-[#4f8f4a]">
                  <span className={`grid h-6 w-6 place-items-center rounded-full ${style.chip}`}>
                    <ZoneIcon className="h-3.5 w-3.5" />
                  </span>
                  Zona {z.id + 1} · {z.from}–{z.to}
                </p>
                <p className="font-display text-lg font-black leading-tight text-[#5b44a8]">{z.name}</p>
                <p className="text-xs font-semibold text-[#7a6a8a]">{z.blurb}</p>
              </motion.div>
            );
          })}

          {Array.from({ length: LEVEL_COUNT }, (_, i) => {
            const id = i + 1;
            const stars = starsOf(id);
            const unlocked = isUnlocked(id);
            const isCurrent = id === current;
            const isFinal = id === LEVEL_COUNT;
            const zoneEnd = isZoneFinal(id) && !isFinal;
            const x = nodeX(i);
            const y = nodeY(i, height);
            return (
              <motion.div
                key={id}
                className="absolute"
                // x/y de Motion (no `transform` en style): Motion lo compone con
                // la animación de escala en vez de borrarlo al animar.
                style={{ left: `${x}%`, top: y, x: '-50%', y: '-50%' }}
                initial={{ scale: 0.6, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {zoneEnd && unlocked && (
                  <span className="absolute -top-6 left-1/2 grid h-6 w-6 -translate-x-1/2 place-items-center rounded-full border-2 border-white bg-[#ffd166] text-[#6b4700] shadow" title="Fin de zona">
                    <Trophy className="h-3.5 w-3.5" />
                  </span>
                )}
                <button
                  type="button"
                  disabled={!unlocked}
                  onClick={() => onPlay(id)}
                  aria-label={`Pedido ${id}${stars ? `, ${stars} estrellas` : ''}${unlocked ? '' : ', bloqueado'}`}
                  className={`relative grid h-[58px] w-[58px] place-items-center rounded-full border-4 font-display text-xl font-black shadow-[0_8px_16px_-6px_rgba(59,42,36,0.35)] transition active:scale-90 sm:h-16 sm:w-16 ${
                    !unlocked
                      ? 'border-white bg-[#e9e3f2] text-[#a89cc0]'
                      : isFinal
                        ? 'border-white bg-gradient-to-b from-[#ffd166] to-[#ff8fb1] text-white'
                        : zoneEnd
                          ? 'border-[#ffd166] bg-gradient-to-b from-[#b8e6a4] to-[#6fa964] text-white'
                          : stars > 0
                            ? 'border-white bg-gradient-to-b from-[#b8e6a4] to-[#6fa964] text-white'
                            : 'border-white bg-gradient-to-b from-[#cbb9ff] to-[#8f72e0] text-white'
                  }`}
                >
                  {isCurrent && (
                    <span className="pointer-events-none absolute -inset-2 animate-ping rounded-full border-4 border-[#ffd166]/80" />
                  )}
                  {isFinal && unlocked && (
                    <span className="pointer-events-none absolute -inset-1.5 rounded-full border-2 border-white/80" />
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

          <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2 rounded-2xl border border-white bg-white/80 px-3 py-2 text-xs font-bold text-[#5b44a8] shadow sm:left-6">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#efe8ff] text-[#7d62c9]">
              <CupSoda className="h-4 w-4" />
            </span>
            Sube por el camino para abrir nuevos pedidos
          </div>
        </div>
      </div>
    </div>
  );
}
