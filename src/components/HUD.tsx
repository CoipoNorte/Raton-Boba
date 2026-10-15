import type { ReactNode } from 'react';
import { Check, Coins, Pause, Sparkles, Volume2, VolumeX, Footprints, Snowflake } from 'lucide-react';
import { CandyIcon } from './CandyIcon';
import { INGREDIENTS } from '../game/ingredients';
import type { GoalStatus, Kind } from '../game/types';

interface PillProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  tone?: 'lavender' | 'matcha' | 'mango' | 'sakura';
}

const TONES: Record<NonNullable<PillProps['tone']>, string> = {
  lavender: 'bg-[#efe8ff] text-[#5b44a8]',
  matcha: 'bg-[#eaf7dc] text-[#3f7a3a]',
  mango: 'bg-[#fff4cf] text-[#8a5a00]',
  sakura: 'bg-[#ffe6ee] text-[#a32a57]',
};

/** Pastilla compacta: la etiqueta sólo aparece cuando el contenedor tiene espacio. */
export function Pill({ icon, label, value, tone = 'lavender' }: PillProps) {
  return (
    <div
      className={`flex min-w-0 items-center gap-1.5 rounded-full border border-white/80 px-2.5 py-1 shadow-sm ${TONES[tone]}`}
      title={label}
    >
      <span className="grid h-5 w-5 shrink-0 place-items-center [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      <span className="hidden text-[11px] font-bold uppercase tracking-wide opacity-80 @[360px]:inline">
        {label}
      </span>
      <span className="truncate text-sm font-extrabold tabular-nums">{value}</span>
    </div>
  );
}

interface IconButtonProps {
  label: string;
  onClick: () => void;
  children: ReactNode;
  pressed?: boolean;
}

/** Botón redondo con icono grande (~60 % del botón) y área táctil cómoda. */
export function IconButton({ label, onClick, children, pressed }: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className="grid aspect-square h-11 shrink-0 cursor-pointer place-items-center rounded-full border-2 border-white bg-white/85 text-[#5b44a8] shadow-[0_6px_14px_-4px_rgba(91,68,168,0.45)] transition active:scale-90 hover:bg-white focus-visible:outline-3 focus-visible:outline-[#7d62c9] sm:h-12 [&>svg]:h-[62%] [&>svg]:w-[62%]"
    >
      {children}
    </button>
  );
}

interface TopBarProps {
  level: number;
  title: string;
  movesLeft: number;
  tips: number;
  cascade: number;
  free: boolean;
  turns: number;
  soundOn: boolean;
  onToggleSound: () => void;
  onPause: () => void;
}

export function TopBar({
  level,
  title,
  movesLeft,
  tips,
  cascade,
  free,
  turns,
  soundOn,
  onToggleSound,
  onPause,
}: TopBarProps) {
  return (
    <header className="@container flex w-full items-center gap-2" aria-label="Marcador">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
        {free ? (
          <Pill icon={<Sparkles />} label="Modo" value="Libre" tone="lavender" />
        ) : (
          <Pill icon={<span className="text-[13px] font-black">{level}</span>} label="Pedido" value={title} tone="lavender" />
        )}
        {free ? (
          <Pill icon={<Footprints />} label="Jugadas" value={turns} tone="matcha" />
        ) : (
          <Pill icon={<Footprints />} label="Movs" value={movesLeft} tone={movesLeft <= 3 ? 'sakura' : 'matcha'} />
        )}
        <Pill icon={<Coins />} label="Propinas" value={tips.toLocaleString('es-ES')} tone="mango" />
        {cascade >= 2 && <Pill icon={<Sparkles />} label="Combo" value={`×${cascade}`} tone="sakura" />}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <IconButton label={soundOn ? 'Silenciar sonido' : 'Activar sonido'} onClick={onToggleSound} pressed={soundOn}>
          {soundOn ? <Volume2 /> : <VolumeX />}
        </IconButton>
        <IconButton label="Pausa" onClick={onPause}>
          <Pause />
        </IconButton>
      </div>
    </header>
  );
}

/** Lista de pedidos: ingrediente, progreso y confirmación verde al cumplirse. */
export function GoalsPanel({ goals, compact = false }: { goals: GoalStatus[]; compact?: boolean }) {
  return (
    <section
      aria-label="Pedido"
      className="@container w-full rounded-3xl border border-white/80 bg-white/70 p-2.5 shadow-md backdrop-blur"
    >
      <ul className={`grid gap-2 ${compact ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {goals.map((g, i) => {
          const goal = g.goal;
          const label = goal.type === 'ice' ? 'Romper hielo' : INGREDIENTS[goal.kind].label;
          const pct = Math.min(100, Math.round((g.current / Math.max(1, g.target)) * 100));
          return (
            <li
              key={i}
              className={`flex min-w-0 items-center gap-2 rounded-2xl p-1.5 ${g.done ? 'bg-[#eaf7dc]' : 'bg-[#faf6ff]'}`}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white shadow-inner">
                {goal.type === 'ice' ? (
                  <CandyIcon kind="leche" ice={1} className="h-8 w-8" />
                ) : (
                  <CandyIcon kind={goal.kind} className="h-8 w-8" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="truncate text-xs font-bold text-[#4a3a6b] @[220px]:text-sm">{label}</span>
                  {g.done ? (
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#4f8f4a] text-white">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                  ) : (
                    <span className="shrink-0 text-xs font-extrabold tabular-nums text-[#5b44a8]">
                      {g.current}/{g.target}
                    </span>
                  )}
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#e6dcff]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#b9a4f0] to-[#8fbf6a] transition-[width] duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

interface FreeStatsPanelProps {
  kinds: Kind[];
  collected: Partial<Record<Kind, number>>;
  iceLeft: number;
}

/** Modo libre: en lugar de objetivos, muestra cuántos sabores has servido en la sesión. */
export function FreeStatsPanel({ kinds, collected, iceLeft }: FreeStatsPanelProps) {
  const served = kinds.reduce((sum, k) => sum + (collected[k] ?? 0), 0);
  return (
    <section
      aria-label="Sabores servidos"
      className="@container w-full rounded-3xl border border-white/80 bg-white/70 p-2.5 shadow-md backdrop-blur"
    >
      <div className="flex items-center justify-between px-1 pb-1.5">
        <p className="text-[11px] font-black uppercase tracking-wider text-[#4f8f4a]">Sabores</p>
        <p className="text-xs font-extrabold tabular-nums text-[#5b44a8]">{served} en total</p>
      </div>
      <ul className="grid grid-cols-2 gap-1.5 @[300px]:grid-cols-3">
        {kinds.map((k) => (
          <li key={k} className="flex min-w-0 items-center gap-1.5 rounded-2xl bg-[#faf6ff] p-1.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white">
              <CandyIcon kind={k} className="h-7 w-7" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-bold text-[#4a3a6b]">{INGREDIENTS[k].short}</p>
              <p className="text-sm font-extrabold tabular-nums text-[#5b44a8]">{collected[k] ?? 0}</p>
            </div>
          </li>
        ))}
        {iceLeft > 0 && (
          <li className="flex min-w-0 items-center gap-1.5 rounded-2xl bg-[#e8f6ff] p-1.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white text-[#3a86c8]">
              <Snowflake className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-bold text-[#2e6a9a]">Hielo</p>
              <p className="text-sm font-extrabold tabular-nums text-[#2e6a9a]">{iceLeft}</p>
            </div>
          </li>
        )}
      </ul>
    </section>
  );
}
