import { useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Coins, Crown, Lock, Star, Volume2, VolumeX } from 'lucide-react';
import { LEVEL_COUNT } from '../game/constants';
import { ZONES, zoneOf, isZoneBoss } from '../game/levels';
import { ZoneScene } from '../components/MapScenery';
import type { SaveData } from '../game/storage';

interface MapScreenProps {
  save: SaveData;
  onBack: () => void;
  onPlay: (levelId: number) => void;
  onToggleSound: () => void;
}

const SPACING = 122;
/** Hueco extra antes de cada zona nueva para que el cartel respire sin tapar nodos. */
const ZONE_GAP = 205;
const TOP_PAD = 180;
/** Espacio bajo el nivel 1: aloja el cartel de la primera región y el mensaje final. */
const BOTTOM_PAD = 360;
/** Altura de referencia del cartel (los más largos llegan a ~160 px en móvil). */
const BANNER_H = 120;

/** Posición horizontal (%) del nodo i: serpentea pero deja libres los laterales decorados. */
function nodeX(index: number): number {
  const base = 50 + 20 * Math.sin(index * 0.82 + 0.5);
  const wobble = 4 * Math.sin(index * 1.93 + 1.1);
  return Math.min(73, Math.max(27, base + wobble));
}

/** Mezcla dos colores hex para teñir los niveles bloqueados con el tono de su región. */
function mixHex(a: string, b: string, t: number): string {
  const parse = (h: string): [number, number, number] => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  const [r1, g1, b1] = parse(a);
  const [r2, g2, b2] = parse(b);
  const ch = (x: number, y: number): number => Math.round(x * t + y * (1 - t));
  return `rgb(${ch(r1, r2)}, ${ch(g1, g2)}, ${ch(b1, b2)})`;
}

/** Propinas abreviadas para cabeceras estrechas (12,4 K · 1,2 M). */
function compactTips(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace('.', ',')}M`;
  if (value >= 10_000) return `${Math.round(value / 1000)}K`;
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace('.', ',')}K`;
  return String(value);
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
  const currentZone = zoneOf(current);

  // Centra el mapa en el pedido actual al entrar.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const target = nodeY(current - 1, height);
    el.scrollTop = Math.max(0, target - el.clientHeight * 0.6);
  }, [current, height]);

  // Segmentos del camino entre nodos consecutivos.
  const segments = useMemo(() => {
    const out: { d: string; id: number }[] = [];
    for (let i = 0; i < LEVEL_COUNT - 1; i++) {
      const x0 = nodeX(i);
      const y0 = nodeY(i, height);
      const x1 = nodeX(i + 1);
      const y1 = nodeY(i + 1, height);
      const ym = (y0 + y1) / 2;
      out.push({ d: `M ${x0} ${y0} C ${x0} ${ym}, ${x1} ${ym}, ${x1} ${y1}`, id: i + 1 });
    }
    return out;
  }, [height]);

  // Bandas ilustradas por región: se solapan y funden entre sí (sin costuras).
  const bands = useMemo(
    () =>
      ZONES.map((z) => {
        const topNode = nodeY(z.to - 1, height);
        const bottomNode = nodeY(z.from - 1, height);
        const top = topNode - 230;
        return { zone: z, top, height: bottomNode - top + 250 };
      }),
    [height],
  );

  return (
    <div className="flex h-full w-full flex-col">
      <header className="z-20 flex items-center gap-2 px-3 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
        <button
          type="button"
          onClick={onBack}
          aria-label="Volver al inicio"
          className="flex h-11 shrink-0 items-center gap-1.5 rounded-full border-2 border-white bg-white/90 px-3 font-extrabold text-[#5b44a8] shadow-lg backdrop-blur active:scale-95 sm:px-4"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="hidden sm:inline">Inicio</span>
        </button>
        <div className="min-w-0 flex-1 text-center">
          <h1 className="truncate font-display text-xl font-black leading-tight text-[#5b44a8] drop-shadow-[0_2px_0_rgba(255,255,255,0.9)] sm:text-3xl">
            <span className="sm:hidden">Tienda</span>
            <span className="hidden sm:inline">Tienda Boba</span>
          </h1>
          <p className="truncate text-[10px] font-bold uppercase tracking-wide text-[#7a6a8a] sm:text-[11px]">
            <span className="sm:hidden">
              {ZONES[currentZone]?.badge} {ZONES[currentZone]?.short} · {current}/{LEVEL_COUNT}
            </span>
            <span className="hidden sm:inline">
              {ZONES[currentZone]?.badge} {ZONES[currentZone]?.name} · Pedido {current}/{LEVEL_COUNT}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="hidden items-center gap-1 rounded-full border border-white bg-[#eaf7dc]/95 px-2.5 py-1.5 text-sm font-extrabold text-[#3f7a3a] shadow sm:flex">
            <Star className="h-4 w-4 fill-[#ffd166] stroke-[#c98a00]" /> {totalStars}
          </span>
          <span className="flex items-center gap-1 rounded-full border border-white bg-[#fff4cf]/95 px-2.5 py-1.5 text-sm font-extrabold text-[#8a5a00] shadow">
            <Coins className="h-4 w-4" />
            <span className="sm:hidden">{compactTips(save.totalTips)}</span>
            <span className="hidden sm:inline">{save.totalTips.toLocaleString('es-ES')}</span>
          </span>
          <button
            type="button"
            onClick={onToggleSound}
            aria-label={save.soundOn ? 'Silenciar' : 'Activar sonido'}
            className="grid h-11 w-11 place-items-center rounded-full border-2 border-white bg-white/90 text-[#5b44a8] shadow-lg backdrop-blur active:scale-90 [&>svg]:h-[62%] [&>svg]:w-[62%]"
          >
            {save.soundOn ? <Volume2 /> : <VolumeX />}
          </button>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="scroll-soft relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain"
      >
        <div className="relative w-full" style={{ height }}>
          {/* Regiones ilustradas: ocupan todo el ancho de la ventana */}
          {bands.map((b) => (
            <ZoneScene
              key={b.zone.id}
              zone={b.zone}
              top={b.top}
              height={b.height}
              reached={current >= b.zone.from}
            />
          ))}

          {/* Columna central de juego: camino, carteles y niveles */}
          <div className="absolute left-1/2 top-0 h-full w-full max-w-[600px] -translate-x-1/2">
          {/* Sombra del camino, da relieve de sendero empedrado */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox={`0 0 100 ${height}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {segments.map((s) => (
              <path
                key={`shadow-${s.id}`}
                d={s.d}
                fill="none"
                vectorEffect="non-scaling-stroke"
                strokeWidth={22}
                strokeLinecap="round"
                stroke="rgba(91,68,168,0.16)"
                transform="translate(0,5)"
              />
            ))}
            {/* Borde crema del sendero */}
            {segments.map((s) => (
              <path
                key={`edge-${s.id}`}
                d={s.d}
                fill="none"
                vectorEffect="non-scaling-stroke"
                strokeWidth={20}
                strokeLinecap="round"
                stroke="#fffaf0"
              />
            ))}
            {/* Relleno según progreso */}
            {segments.map((s) => {
              const done = starsOf(s.id) > 0;
              return (
                <path
                  key={`fill-${s.id}`}
                  d={s.d}
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                  strokeWidth={13}
                  strokeLinecap="round"
                  stroke={done ? '#8fbf6a' : '#e2d7f7'}
                />
              );
            })}
            {/* Guías punteadas sobre el sendero */}
            {segments.map((s) => {
              const done = starsOf(s.id) > 0;
              return (
                <path
                  key={`dash-${s.id}`}
                  d={s.d}
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                  strokeWidth={3.5}
                  strokeLinecap="round"
                  strokeDasharray="1 14"
                  stroke={done ? 'rgba(255,255,255,0.95)' : 'rgba(125,98,201,0.35)'}
                />
              );
            })}
          </svg>

          {/* Carteles de región */}
          {ZONES.map((z) => {
            const idx = z.from - 1;
            // La primera región se rotula bajo el nivel 1; las demás, en el hueco entre regiones.
            const y =
              idx === 0
                ? nodeY(0, height) + 112
                : (nodeY(idx, height) + nodeY(idx - 1, height)) / 2 - BANNER_H / 2;
            const reached = current >= z.from;
            return (
              <div
                key={z.id}
                className="absolute left-1/2 z-[3] w-[min(86%,400px)] -translate-x-1/2"
                style={{ top: y }}
              >
                <div
                  className={`relative rounded-[26px] border-[3px] px-4 py-2.5 text-center shadow-[0_12px_28px_-8px_rgba(59,42,36,0.45)] backdrop-blur-md ${
                    reached ? 'border-white bg-white/95' : 'border-white/70 bg-white/75'
                  }`}
                  style={{ boxShadow: reached ? `0 10px 0 -4px ${z.accent}55, 0 16px 30px -12px rgba(59,42,36,0.5)` : undefined }}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-lg drop-shadow-sm">{z.badge}</span>
                    <p
                      className="text-[10px] font-black uppercase tracking-[0.28em]"
                      style={{ color: reached ? z.accent : '#a79cc0' }}
                    >
                      Región {z.id + 1}
                    </p>
                  </div>
                  <p className="font-display text-lg font-black leading-tight text-[#5b44a8]">{z.name}</p>
                  <p className="text-xs font-semibold leading-snug text-[#7a6a8a]">{z.blurb}</p>
                  {!reached && (
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#f1ecf7] px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-[#8a7aa8]">
                      <Lock className="h-3 w-3" /> Pedido {z.from}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Nodos de nivel */}
          {Array.from({ length: LEVEL_COUNT }, (_, i) => {
            const id = i + 1;
            const stars = starsOf(id);
            const unlocked = isUnlocked(id);
            const isCurrent = id === current;
            const boss = isZoneBoss(id);
            const zone = ZONES[zoneOf(id)];
            const x = nodeX(i);
            const y = nodeY(i, height);
            const accent = zone?.accent ?? '#7d62c9';

            const size = boss ? 72 : 60;
            // Los bloqueados conservan el tono de su región para que el mapa siga vivo.
            const face = !unlocked
              ? mixHex(accent, '#efeaf7', 0.32)
              : stars > 0
                ? '#8fc975'
                : accent;
            const rim = !unlocked ? '#ffffff' : stars > 0 ? '#4f8f4a' : '#ffffff';

            return (
              <div
                key={id}
                className="absolute z-[4]"
                style={{ left: `${x}%`, top: y, transform: 'translate(-50%, -50%)' }}
              >
                <button
                  type="button"
                  disabled={!unlocked}
                  onClick={() => onPlay(id)}
                  aria-label={`Pedido ${id}${boss ? ', jefe de región' : ''}${stars ? `, ${stars} estrellas` : ''}${unlocked ? '' : ', bloqueado'}`}
                  className="relative grid place-items-center rounded-full font-display font-black transition-transform duration-150 active:scale-90 disabled:active:scale-100"
                  style={{
                    width: size,
                    height: size,
                    color: unlocked ? '#fff' : '#ffffffdd',
                    fontSize: boss ? 24 : 20,
                    background: `radial-gradient(circle at 34% 28%, #ffffffcc 0%, #ffffff00 45%), ${face}`,
                    border: `4px solid ${rim}`,
                    boxShadow: unlocked
                      ? `0 7px 0 -1px ${stars > 0 ? '#4f8f4a' : accent}99, 0 14px 22px -8px rgba(59,42,36,0.55)`
                      : `0 6px 0 -1px ${mixHex(accent, '#c9bedb', 0.4)}, 0 12px 20px -8px rgba(59,42,36,0.4)`,
                  }}
                >
                  {isCurrent && (
                    <span className="pointer-events-none absolute -inset-3 animate-ping rounded-full border-4 border-[#ffd166]" />
                  )}
                  {boss && unlocked && (
                    <Crown className="absolute -top-5 h-5 w-5 fill-[#ffd166] stroke-[#c98a00] drop-shadow" />
                  )}
                  {!unlocked ? (
                    <Lock className="h-5 w-5" />
                  ) : (
                    <span className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.28)]">{id}</span>
                  )}
                </button>

                {unlocked && (
                  <div
                    className="absolute left-1/2 top-full mt-1 flex -translate-x-1/2 gap-0.5 rounded-full bg-white/80 px-1 py-0.5 shadow-sm"
                    aria-hidden="true"
                  >
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`h-3.5 w-3.5 ${s <= stars ? 'fill-[#ffd166] stroke-[#c98a00]' : 'fill-white stroke-[#c9bedb]'}`}
                        strokeWidth={2}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Mensaje de salida del camino */}
          <motion.div
            className="pointer-events-none absolute bottom-4 left-1/2 z-[3] w-[min(92%,360px)] -translate-x-1/2 rounded-2xl border-2 border-white bg-white/90 px-3 py-2 text-center text-xs font-bold leading-snug text-[#5b44a8] shadow-lg backdrop-blur"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            🧋 Sube por el camino y conquista las {ZONES.length} regiones de la Tienda
          </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
