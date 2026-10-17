import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Flame, Sparkles } from 'lucide-react';
import { Board } from '../components/Board';
import { FreeStatsPanel, GoalsPanel, TopBar } from '../components/HUD';
import { Mascot, type MascotMood } from '../components/Mascot';
import { FreeSummaryModal, PauseMenu, ResultModal } from '../components/Modals';
import { useBobaGame } from '../hooks/useBobaGame';
import { useElementSize, useLayout } from '../hooks/useLayout';
import { cookieRemaining, iceRemaining, starsFor } from '../game/logic';
import { sfx } from '../game/sound';
import type { FreeSummary, GameState, LevelConfig, LevelResult } from '../game/types';

interface PlayScreenProps {
  cfg: LevelConfig;
  soundOn: boolean;
  hasNext: boolean;
  onToggleSound: () => void;
  onExit: () => void;
  onNext: () => void;
  onFinish: (result: LevelResult) => void;
  onRetry: () => void;
  onFreeEnd: (summary: FreeSummary) => void;
  onNewFree: () => void;
  freeBest: number;
}

/** Tamaño de celda según el área real disponible (no sólo la ventana). */
function computeCell(width: number, height: number, cols: number): number {
  if (!width || !height) return 0;
  const raw = Math.floor(Math.min(width, height) / (cols + 0.3));
  return Math.max(0, Math.min(92, raw));
}

function servedCount(game: GameState, cfg: LevelConfig): number {
  return cfg.kinds.reduce((sum, k) => sum + (game.collected[k] ?? 0), 0);
}

const TIPS = [
  'Combina 4 en fila para crear rayados.',
  'Combina en forma de T o L para crear bombas y Tiger Boba.',
  'El hielo y la galleta se rompen con jugadas vecinas.',
  'Los combos altos desatan la ¡Fiebre de Boba! con multiplicadores.',
];

const FREE_LINES = [
  'Sin prisas, barista. Tú marcas el ritmo.',
  'Cada cascada suma ricas propinas extra.',
  'Prueba mezclar Tiger Boba con Arcoíris.',
  '¡El aroma a té fresco inunda la tienda!',
];

export function PlayScreen({
  cfg,
  soundOn,
  hasNext,
  onToggleSound,
  onExit,
  onNext,
  onFinish,
  onRetry,
  onFreeEnd,
  onNewFree,
  freeBest,
}: PlayScreenProps) {
  const free = !!cfg.free;
  const [paused, setPaused] = useState(false);
  const [ending, setEnding] = useState<{ summary: FreeSummary; record: boolean } | null>(null);
  const { game, goals, tap, swap, restart } = useBobaGame(cfg, paused, onFinish);
  const layout = useLayout();
  const [setAreaEl, area] = useElementSize<HTMLDivElement>();

  const finished = game.status !== 'playing';
  const blocked = finished || ending !== null;
  const cell = computeCell(area.width, area.height, cfg.cols);
  const stars = starsFor(game.tips, cfg, game.status === 'won');
  const iceLeft = iceRemaining(game.board);
  const cookieLeft = cookieRemaining(game.board);

  const isFever = game.cascade >= 3;
  const shouldShake = (game.feverLevel !== undefined && game.feverLevel > 0) || game.popping.length >= 7;

  /** Rótulo escalonado según lo grande que sea la cascada. */
  const comboTier =
    game.cascade >= 6
      ? { label: '¡BOBA LEGENDARIO!', ring: 'from-[#ffd166] via-[#ff6b35] to-[#e0517d]' }
      : game.cascade >= 5
        ? { label: '¡INCREÍBLE!', ring: 'from-[#ff9f1c] via-[#ff5400] to-[#c9307d]' }
        : game.cascade >= 4
          ? { label: '¡ESPECTACULAR!', ring: 'from-[#ffb703] via-[#ff70a6] to-[#7d62c9]' }
          : game.cascade >= 3
            ? { label: '¡BOBA RUSH!', ring: 'from-[#7d62c9] via-[#ff70a6] to-[#ffd166]' }
            : null;

  const mood: MascotMood = free
    ? game.cascade >= 2
      ? 'happy'
      : 'idle'
    : game.status === 'won'
      ? 'happy'
      : game.status === 'lost' || game.movesLeft <= 3
        ? 'worried'
        : 'idle';

  // Teclado: Escape o P pausan; no hay efecto mientras hay un resultado.
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (blocked) return;
      if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setPaused((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [blocked]);

  const endFree = (): void => {
    const summary: FreeSummary = {
      tips: game.tips,
      bestCombo: game.maxCascade,
      turns: game.turns,
      served: servedCount(game, cfg),
    };
    setPaused(false);
    setEnding({ summary, record: summary.tips > freeBest && summary.tips > 0 });
    onFreeEnd(summary);
  };

  const boardArea = (
    <div ref={setAreaEl} className="relative flex min-h-0 min-w-0 flex-1 items-center justify-center">
      {cell >= 20 && (
        <Board
          board={game.board}
          cell={cell}
          popping={game.popping}
          selected={game.selected}
          hint={game.hint}
          onTap={tap}
          onSwap={swap}
          label="Tablero de boba"
          shake={shouldShake}
          fever={game.cascade}
        />
      )}

      {/* Cartel estimulante de ganancia y combo */}
      <AnimatePresence>
        {game.gain > 0 && (
          <motion.div
            key={game.gainKey}
            className={`pointer-events-none absolute left-1/2 top-1 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full border-2 px-3.5 py-1 text-sm font-black shadow-lg ${
              isFever
                ? 'border-[#ffe066] bg-gradient-to-r from-[#ff9f1c] via-[#ff5400] to-[#e01a4f] text-white shadow-[0_0_20px_rgba(255,159,28,0.8)]'
                : 'border-white bg-[#ffd166] text-[#8a5a00]'
            }`}
            initial={{ opacity: 0, y: 12, scale: 0.6 }}
            animate={{ opacity: 1, y: 0, scale: isFever ? 1.15 : 1 }}
            exit={{ opacity: 0, y: -28, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 450, damping: 18 }}
          >
            {isFever && <Flame className="h-4 w-4 animate-bounce text-yellow-200" />}
            <span>+{game.gain.toLocaleString('es-ES')} propinas</span>
            {game.cascade >= 2 && (
              <span className="rounded-full bg-white/30 px-1.5 py-0.5 text-xs font-black">
                {isFever ? `¡FIEBRE ×${game.cascade}!` : `×${game.cascade}`}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rótulo central escalonado del combo */}
      <AnimatePresence>
        {comboTier && (
          <motion.div
            key={`tier-${game.cascade}-${game.gainKey}`}
            className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 0.3, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: -4 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 14 }}
          >
            <span
              className={`block rounded-2xl border-4 border-white bg-gradient-to-r ${comboTier.ring} px-5 py-2 font-display text-2xl font-black uppercase tracking-wide text-white drop-shadow-[0_4px_0_rgba(59,42,36,0.35)] shadow-2xl sm:text-3xl`}
            >
              {comboTier.label}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Banner flotante de Boba Rush / Combo fever */}
      <AnimatePresence>
        {isFever && (
          <motion.div
            className="pointer-events-none absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/80 bg-gradient-to-r from-[#7d62c9] via-[#ff70a6] to-[#ffd166] px-3 py-1 text-xs font-black text-white shadow-xl"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <Sparkles className="h-3.5 w-3.5 animate-spin" /> ¡Multiplicador ×{Math.min(5, 1 + (game.cascade - 1) * 0.5)}!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const hintLine = (
    <p className="text-center text-[11px] font-bold text-[#7a6a8a]">
      Toca dos fichas vecinas o arrástralas para combinarlas
    </p>
  );

  const topBar = (
    <TopBar
      level={cfg.id}
      title={cfg.title}
      movesLeft={game.movesLeft}
      tips={game.tips}
      cascade={game.cascade}
      free={free}
      turns={game.turns}
      soundOn={soundOn}
      onToggleSound={onToggleSound}
      onPause={() => setPaused(true)}
    />
  );

  const panel = (compact: boolean): ReactNode =>
    free ? (
      <FreeStatsPanel kinds={cfg.kinds} collected={game.collected} iceLeft={iceLeft} cookieLeft={cookieLeft} />
    ) : (
      <GoalsPanel goals={goals} compact={compact} />
    );

  const message = free
    ? FREE_LINES[game.turns % FREE_LINES.length]
    : isFever
      ? '¡INCREÍBLE! ¡Fiebre de Boba!'
      : mood === 'happy'
        ? '¡Pedido perfecto!'
        : mood === 'worried' && game.status === 'playing'
          ? '¡Quedan pocos movimientos!'
          : game.status === 'lost'
            ? 'Respira y vuelve a intentarlo.'
            : '¡Tú puedes, barista!';

  let body: ReactNode;

  if (layout.mode === 'stack') {
    body = (
      <div className="flex h-full flex-col gap-2 px-2.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-[max(0.5rem,env(safe-area-inset-top))]">
        {topBar}
        <div className="flex items-stretch gap-2">
          <div className="min-w-0 flex-1">{panel(true)}</div>
          <Mascot mood={mood} size={layout.mascotSize} className="shrink-0 self-center" />
        </div>
        {boardArea}
        {hintLine}
      </div>
    );
  } else if (layout.mode === 'split') {
    body = (
      <div className="grid h-full grid-cols-[minmax(0,0.85fr)_minmax(0,1.5fr)] gap-2 px-2.5 py-2 pl-[max(0.625rem,env(safe-area-inset-left))] pr-[max(0.625rem,env(safe-area-inset-right))]">
        <div className="flex min-h-0 flex-col gap-2 overflow-y-auto">
          {topBar}
          {panel(false)}
          <div className="mt-auto flex items-center justify-center gap-2">
            <Mascot mood={mood} size={layout.mascotSize} />
          </div>
        </div>
        <div className="flex min-h-0 min-w-0 flex-col gap-1">
          {boardArea}
          {hintLine}
        </div>
      </div>
    );
  } else {
    body = (
      <div className="mx-auto grid h-full w-full max-w-[1500px] grid-cols-[210px_minmax(0,1fr)_190px] gap-3 p-3 px-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] xl:grid-cols-[minmax(230px,300px)_minmax(0,1fr)_minmax(200px,260px)] xl:gap-4 xl:p-4 xl:px-[max(1rem,env(safe-area-inset-left))] xl:pr-[max(1rem,env(safe-area-inset-right))]">
        <aside className="flex min-h-0 flex-col gap-3 overflow-y-auto">
          {panel(false)}
          <div className="rounded-3xl border border-white/80 bg-white/70 p-4 text-sm font-semibold text-[#5b44a8] shadow-md">
            <p className="mb-1 text-xs font-black uppercase tracking-widest text-[#4f8f4a]">Consejo del ratón</p>
            <ul className="grid gap-1.5 text-[#6a5a80]">
              {TIPS.map((t) => (
                <li key={t} className="flex gap-2">
                  <span aria-hidden="true">🧋</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col gap-2">
          {topBar}
          {boardArea}
          {hintLine}
        </section>

        <aside className="flex min-h-0 flex-col items-center justify-center gap-3">
          <Mascot mood={mood} size={layout.mascotSize} />
          <div className="rounded-2xl bg-white/80 px-4 py-2 text-center text-sm font-bold text-[#5b44a8] shadow">
            {message}
          </div>
        </aside>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Viñeta cálida que envuelve la pantalla durante la fiebre de combos */}
      {isFever && (
        <div
          className="fever-glow pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              'radial-gradient(circle at 50% 55%, rgba(255,209,102,0) 42%, rgba(255,107,53,0.26) 78%, rgba(224,81,125,0.4) 100%)',
          }}
          aria-hidden="true"
        />
      )}

      {body}

      <PauseMenu
        open={paused && !blocked}
        free={free}
        soundOn={soundOn}
        onToggleSound={onToggleSound}
        onContinue={() => setPaused(false)}
        onRestart={() => {
          setPaused(false);
          restart();
        }}
        onMap={() => {
          sfx.click();
          onExit();
        }}
        onEndFree={endFree}
      />

      {!free && (
        <AnimatePresence>
          {finished && !game.busy && (
            <ResultModal
              key={`result-${game.status}`}
              won={game.status === 'won'}
              levelId={cfg.id}
              tips={game.tips}
              bonus={game.bonus}
              stars={stars}
              hasNext={hasNext && game.status === 'won'}
              onNext={onNext}
              onRetry={onRetry}
              onMap={onExit}
            />
          )}
        </AnimatePresence>
      )}

      {ending && (
        <FreeSummaryModal
          summary={ending.summary}
          record={ending.record}
          onNew={onNewFree}
          onExit={onExit}
        />
      )}
    </div>
  );
}
