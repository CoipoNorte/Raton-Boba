import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Cookie, Play, Snowflake, Sparkles, Trophy, Star, Layers } from 'lucide-react';
import { CandyIcon } from '../components/CandyIcon';
import { Mascot } from '../components/Mascot';
import { ALL_KINDS, INGREDIENTS } from '../game/ingredients';
import type { FreePrefs, SaveData } from '../game/storage';
import type { FreeKindCount } from '../game/types';
import type { LayoutInfo } from '../hooks/useLayout';

interface FreeScreenProps {
  save: SaveData;
  layout: LayoutInfo;
  onBack: () => void;
  onStart: (prefs: FreePrefs) => void;
}

const KIND_OPTIONS: { count: FreeKindCount; label: string; hint: string }[] = [
  { count: 4, label: '4 sabores', hint: 'Tranquilo' },
  { count: 5, label: '5 sabores', hint: 'Equilibrado' },
  { count: 6, label: '6 sabores', hint: 'Maestro' },
];

/** Lobby del modo libre: elige sabores, hielo y galletas, y consulta tus récords. */
export function FreeScreen({ save, layout, onBack, onStart }: FreeScreenProps) {
  const [prefs, setPrefs] = useState<FreePrefs>(save.freePrefs);
  const row = layout.orientation === 'landscape' && layout.height < 620;
  const mascotSize = Math.round(layout.mascotSize * (row ? 1.2 : 1.5));

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
          <h1 className="font-display text-2xl font-black leading-none text-[#5b44a8] sm:text-3xl">Modo Libre</h1>
          <p className="truncate text-[11px] font-bold uppercase tracking-wider text-[#7a6a8a]">Sin pedidos · Sin prisas</p>
        </div>
        <span className="w-[88px]" aria-hidden="true" />
      </header>

      <div className="scroll-soft min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div
          className={`mx-auto flex w-full max-w-md flex-col items-center gap-4 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2 text-center ${
            row ? 'sm:max-w-2xl sm:flex-row sm:items-start sm:text-left' : ''
          }`}
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="shrink-0 self-center"
          >
            <Mascot mood="zen" size={mascotSize} />
          </motion.div>

          <div className="flex w-full min-w-0 flex-col gap-3">
            <p className="text-sm font-semibold text-[#7a6a8a]">
              Prepara todas las bebidas que quieras. No hay objetivos ni límite de jugadas: solo tú, el tablero y tus propinas.
            </p>

            <div className="grid grid-cols-3 gap-2">
              <Record icon={<Trophy className="h-4 w-4" />} label="Mejor sesión" value={save.freeBest.toLocaleString('es-ES')} tone="bg-[#fff4cf] text-[#8a5a00]" />
              <Record icon={<Sparkles className="h-4 w-4" />} label="Mejor combo" value={`×${save.freeBestCombo}`} tone="bg-[#ffe6ee] text-[#a32a57]" />
              <Record icon={<Star className="h-4 w-4" />} label="Sesiones" value={save.freeSessions} tone="bg-[#eaf7dc] text-[#3f7a3a]" />
            </div>

            <fieldset className="rounded-3xl border border-white bg-white/75 p-3 text-left shadow-md">
              <legend className="flex items-center gap-1.5 px-1 text-xs font-black uppercase tracking-wider text-[#4f8f4a]">
                <Layers className="h-4 w-4" /> Sabores en la barra
              </legend>
              <div className="mt-1 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Número de sabores">
                {KIND_OPTIONS.map((opt) => {
                  const active = prefs.kinds === opt.count;
                  return (
                    <button
                      key={opt.count}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setPrefs((p) => ({ ...p, kinds: opt.count }))}
                      className={`flex min-h-[64px] flex-col items-center justify-center gap-0.5 rounded-2xl border-2 px-1 py-1.5 transition active:scale-95 ${
                        active
                          ? 'border-[#7d62c9] bg-[#efe8ff] text-[#4a3a8a] shadow-inner'
                          : 'border-[#ece4fb] bg-white text-[#6a5a80]'
                      }`}
                    >
                      <span className="text-sm font-black">{opt.label}</span>
                      <span className="text-[11px] font-semibold opacity-80">{opt.hint}</span>
                    </button>
                  );
                })}
              </div>
              <ul className="mt-2 flex flex-wrap justify-center gap-1" aria-label="Sabores incluidos">
                {ALL_KINDS.slice(0, prefs.kinds).map((k) => (
                  <li key={k} className="grid h-9 w-9 place-items-center rounded-xl bg-white shadow-inner" title={INGREDIENTS[k].label}>
                    <CandyIcon kind={k} className="h-7 w-7" />
                  </li>
                ))}
              </ul>
            </fieldset>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                role="switch"
                aria-checked={prefs.ice}
                onClick={() => setPrefs((p) => ({ ...p, ice: !p.ice }))}
                className="flex min-h-[54px] items-center justify-between gap-2.5 rounded-3xl border border-white bg-white/75 px-3.5 py-2 text-left font-bold text-[#4a3a6b] shadow-md active:scale-[0.99]"
              >
                <span className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#e8f6ff] text-[#3a86c8]">
                    <Snowflake className="h-4 w-4" />
                  </span>
                  <span className="text-xs">
                    Hielo
                    <span className="block text-[10px] font-semibold text-[#7a6a8a]">Fichas congeladas</span>
                  </span>
                </span>
                <span
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${prefs.ice ? 'bg-[#8fbf6a]' : 'bg-[#d9cfe8]'}`}
                  aria-hidden="true"
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${prefs.ice ? 'translate-x-[22px]' : 'translate-x-0.5'}`}
                  />
                </span>
              </button>

              <button
                type="button"
                role="switch"
                aria-checked={prefs.cookie}
                onClick={() => setPrefs((p) => ({ ...p, cookie: !p.cookie }))}
                className="flex min-h-[54px] items-center justify-between gap-2.5 rounded-3xl border border-white bg-white/75 px-3.5 py-2 text-left font-bold text-[#4a3a6b] shadow-md active:scale-[0.99]"
              >
                <span className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#fff2e0] text-[#a35c1d]">
                    <Cookie className="h-4 w-4" />
                  </span>
                  <span className="text-xs">
                    Galleta
                    <span className="block text-[10px] font-semibold text-[#7a6a8a]">Topping crujiente</span>
                  </span>
                </span>
                <span
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${prefs.cookie ? 'bg-[#8fbf6a]' : 'bg-[#d9cfe8]'}`}
                  aria-hidden="true"
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${prefs.cookie ? 'translate-x-[22px]' : 'translate-x-0.5'}`}
                  />
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => onStart(prefs)}
              className="flex h-16 items-center justify-center gap-2 rounded-3xl bg-gradient-to-b from-[#9b84f0] to-[#7d62c9] text-2xl font-black text-white shadow-[0_12px_24px_-8px_rgba(125,98,201,0.8),inset_0_2px_0_rgba(255,255,255,0.35)] transition active:scale-95"
            >
              <Play className="h-6 w-6 fill-white" /> Empezar a preparar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Record({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string | number; tone: string }) {
  return (
    <div className={`flex min-w-0 flex-col items-center gap-0.5 rounded-2xl border border-white px-2 py-2 shadow-sm ${tone}`}>
      <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wide opacity-90">
        {icon}
        <span className="truncate">{label}</span>
      </span>
      <span className="text-xl font-black tabular-nums">{value}</span>
    </div>
  );
}
