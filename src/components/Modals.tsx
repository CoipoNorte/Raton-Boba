import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Play, RotateCcw, Star, Trophy, Volume2, VolumeX, ArrowRight, Sparkles, Flag } from 'lucide-react';
import { sfx } from '../game/sound';
import type { FreeSummary } from '../game/types';

const OVERLAY = 'fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#3b2a24]/40 p-4 backdrop-blur-sm';

interface PauseMenuProps {
  open: boolean;
  free: boolean;
  soundOn: boolean;
  onToggleSound: () => void;
  onContinue: () => void;
  onRestart: () => void;
  onMap: () => void;
  onEndFree: () => void;
}

export function PauseMenu({
  open,
  free,
  soundOn,
  onToggleSound,
  onContinue,
  onRestart,
  onMap,
  onEndFree,
}: PauseMenuProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="pause"
          className={OVERLAY}
          role="dialog"
          aria-modal="true"
          aria-label="Pausa"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) onContinue();
          }}
        >
          <motion.div
            className="w-full max-w-sm rounded-[2rem] border-4 border-white bg-[#fffaf0] p-5 shadow-2xl"
            initial={{ scale: 0.9, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          >
            <h2 className="text-center text-2xl font-black text-[#5b44a8]">Pausa en el laboratorio</h2>
            <p className="mt-1 text-center text-sm text-[#7a6a8a]">
              {free ? 'Tu sesión libre está en pausa.' : 'El tiempo de tu pedido está detenido.'}
            </p>

            <div className="mt-4 grid gap-2.5">
              <button
                type="button"
                onClick={onContinue}
                className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-[#9b84f0] to-[#7d62c9] text-lg font-black text-white shadow-[0_8px_18px_-6px_rgba(125,98,201,0.7)] active:scale-95"
              >
                <Play className="h-6 w-6 fill-white" /> Continuar
              </button>

              <button
                type="button"
                onClick={onToggleSound}
                aria-pressed={soundOn}
                className="flex h-12 items-center justify-between rounded-2xl border-2 border-[#e6dcff] bg-white px-4 font-bold text-[#4a3a6b] active:scale-95"
              >
                <span className="flex items-center gap-2">
                  {soundOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                  Sonido ASMR
                </span>
                <span className={`rounded-full px-3 py-0.5 text-xs font-black ${soundOn ? 'bg-[#eaf7dc] text-[#3f7a3a]' : 'bg-[#f1ecf7] text-[#7a6a8a]'}`}>
                  {soundOn ? 'Activado' : 'Silencio'}
                </span>
              </button>

              {free ? (
                <button
                  type="button"
                  onClick={onEndFree}
                  className="flex h-12 items-center justify-center gap-2 rounded-2xl border-2 border-[#ffd9a0] bg-[#fff4cf] font-bold text-[#8a5a00] active:scale-95"
                >
                  <Flag className="h-5 w-5" /> Terminar sesión y ver resumen
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onRestart}
                    className="flex h-12 items-center justify-center gap-2 rounded-2xl border-2 border-[#ffd9a0] bg-[#fff4cf] font-bold text-[#8a5a00] active:scale-95"
                  >
                    <RotateCcw className="h-5 w-5" /> Reiniciar pedido
                  </button>

                  <button
                    type="button"
                    onClick={onMap}
                    className="flex h-12 items-center justify-center gap-2 rounded-2xl border-2 border-[#d6ecc6] bg-[#eaf7dc] font-bold text-[#3f7a3a] active:scale-95"
                  >
                    <Home className="h-5 w-5" /> Volver a la Tienda
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ResultModalProps {
  won: boolean;
  levelId: number;
  tips: number;
  bonus: number;
  stars: number;
  hasNext: boolean;
  onNext: () => void;
  onRetry: () => void;
  onMap: () => void;
}

export function ResultModal({ won, levelId, tips, bonus, stars, hasNext, onNext, onRetry, onMap }: ResultModalProps) {
  useEffect(() => {
    if (!won) return;
    const timers: number[] = [];
    for (let i = 0; i < stars; i++) {
      timers.push(window.setTimeout(() => sfx.star(i), 380 + i * 260));
    }
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [won, stars]);

  return (
    <motion.div
      className={OVERLAY}
      role="dialog"
      aria-modal="true"
      aria-label={won ? 'Pedido completado' : 'Sin movimientos'}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="w-full max-w-sm rounded-[2rem] border-4 border-white bg-[#fffaf0] p-5 text-center shadow-2xl"
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 20 }}
      >
        {won ? (
          <>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#4f8f4a]">Pedido #{levelId} listo</p>
            <h2 className="mt-1 text-3xl font-black text-[#5b44a8]">¡Sellado y servido!</h2>
            <div className="mt-3 flex items-center justify-center gap-2" aria-label={`${stars} estrellas`}>
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0, rotate: -40 }}
                  animate={{ scale: i < stars ? 1 : 0.8, rotate: 0 }}
                  transition={{ delay: 0.25 + i * 0.26, type: 'spring', stiffness: 360, damping: 13 }}
                  className={i < stars ? 'text-[#ffb400]' : 'text-[#d9cfe8]'}
                >
                  <Star className={`h-12 w-12 ${i < stars ? 'fill-[#ffd166] stroke-[#c98a00]' : 'fill-[#efeaf6] stroke-[#c9bedb]'}`} strokeWidth={2} />
                </motion.span>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-left">
              <div className="rounded-2xl bg-[#fff4cf] p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#8a5a00]">Propinas</p>
                <p className="text-2xl font-black tabular-nums text-[#8a5a00]">{tips.toLocaleString('es-ES')}</p>
              </div>
              <div className="rounded-2xl bg-[#efe8ff] p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#5b44a8]">Extra movs</p>
                <p className="text-2xl font-black tabular-nums text-[#5b44a8]">+{bonus}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              {hasNext && (
                <button
                  type="button"
                  onClick={onNext}
                  className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-[#9b84f0] to-[#7d62c9] text-lg font-black text-white shadow-[0_8px_18px_-6px_rgba(125,98,201,0.7)] active:scale-95"
                >
                  Siguiente pedido <ArrowRight className="h-5 w-5" />
                </button>
              )}
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={onRetry} className="flex h-12 items-center justify-center gap-1.5 rounded-2xl border-2 border-[#ffd9a0] bg-[#fff4cf] font-bold text-[#8a5a00] active:scale-95">
                  <RotateCcw className="h-5 w-5" /> Repetir
                </button>
                <button type="button" onClick={onMap} className="flex h-12 items-center justify-center gap-1.5 rounded-2xl border-2 border-[#d6ecc6] bg-[#eaf7dc] font-bold text-[#3f7a3a] active:scale-95">
                  <Home className="h-5 w-5" /> Tienda
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#a32a57]">Se acabaron los movimientos</p>
            <h2 className="mt-1 text-3xl font-black text-[#5b44a8]">¡Casi, amigo!</h2>
            <p className="mt-2 text-sm text-[#7a6a8a]">
              Tu mezcla no llegó a todos los objetivos. Puedes intentarlo de nuevo con otra estrategia.
            </p>
            <div className="mt-3 rounded-2xl bg-[#fff4cf] p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#8a5a00]">Propinas de este intento</p>
              <p className="flex items-center justify-center gap-2 text-2xl font-black tabular-nums text-[#8a5a00]">
                <Trophy className="h-6 w-6" /> {tips.toLocaleString('es-ES')}
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={onRetry} className="flex h-14 items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-b from-[#9b84f0] to-[#7d62c9] font-black text-white active:scale-95">
                <RotateCcw className="h-5 w-5" /> Reintentar
              </button>
              <button type="button" onClick={onMap} className="flex h-14 items-center justify-center gap-1.5 rounded-2xl border-2 border-[#d6ecc6] bg-[#eaf7dc] font-bold text-[#3f7a3a] active:scale-95">
                <Home className="h-5 w-5" /> Tienda
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

interface FreeSummaryModalProps {
  summary: FreeSummary;
  record: boolean;
  onNew: () => void;
  onExit: () => void;
}

/** Resumen al terminar una sesión del modo libre. */
export function FreeSummaryModal({ summary, record, onNew, onExit }: FreeSummaryModalProps) {
  return (
    <motion.div className={OVERLAY} role="dialog" aria-modal="true" aria-label="Resumen de la sesión libre" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div
        className="w-full max-w-sm rounded-[2rem] border-4 border-white bg-[#fffaf0] p-5 text-center shadow-2xl"
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 20 }}
      >
        <p className="text-xs font-black uppercase tracking-[0.25em] text-[#4f8f4a]">Sesión libre terminada</p>
        <h2 className="mt-1 text-3xl font-black text-[#5b44a8]">¡Buen servicio!</h2>
        {record && (
          <motion.p
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 380, damping: 14 }}
            className="mx-auto mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#ffd166] px-3 py-1 text-sm font-black text-[#6b4700] shadow"
          >
            <Star className="h-4 w-4 fill-white stroke-[#6b4700]" /> ¡Nuevo récord libre!
          </motion.p>
        )}

        <div className="mt-4 rounded-2xl bg-[#fff4cf] p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#8a5a00]">Propinas de la sesión</p>
          <p className="text-4xl font-black tabular-nums text-[#8a5a00]">{summary.tips.toLocaleString('es-ES')}</p>
        </div>

        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-[#ffe6ee] p-2.5">
            <p className="text-[10px] font-bold uppercase text-[#a32a57]">Combo</p>
            <p className="text-xl font-black tabular-nums text-[#a32a57]">×{summary.bestCombo}</p>
          </div>
          <div className="rounded-2xl bg-[#eaf7dc] p-2.5">
            <p className="text-[10px] font-bold uppercase text-[#3f7a3a]">Jugadas</p>
            <p className="text-xl font-black tabular-nums text-[#3f7a3a]">{summary.turns}</p>
          </div>
          <div className="rounded-2xl bg-[#efe8ff] p-2.5">
            <p className="text-[10px] font-bold uppercase text-[#5b44a8]">Sabores</p>
            <p className="text-xl font-black tabular-nums text-[#5b44a8]">{summary.served}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" onClick={onNew} className="flex h-14 items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-b from-[#9b84f0] to-[#7d62c9] font-black text-white active:scale-95">
            <Sparkles className="h-5 w-5" /> Nueva sesión
          </button>
          <button type="button" onClick={onExit} className="flex h-14 items-center justify-center gap-1.5 rounded-2xl border-2 border-[#d6ecc6] bg-[#eaf7dc] font-bold text-[#3f7a3a] active:scale-95">
            <Home className="h-5 w-5" /> Inicio
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
