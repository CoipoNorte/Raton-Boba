import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Board } from '../components/Board';
import { FreeStatsPanel, GoalsPanel, TopBar } from '../components/HUD';
import { Mascot, type MascotMood } from '../components/Mascot';
import { FreeSummaryModal, PauseMenu, ResultModal } from '../components/Modals';
import { useBobaGame } from '../hooks/useBobaGame';
import { useElementSize, useLayout } from '../hooks/useLayout';
import { iceRemaining, starsFor } from '../game/logic';
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
  'Combina 4 fichas en fila para crear un power-up.',
  'Un power-up que se mezcla con otro explota con más fuerza.',
  'El hielo se rompe cuando una combinación toca su vecino.',
];

const FREE_LINES = [
  'Sin prisas, barista. Tú marcas el ritmo.',
  'Cada cascada suma propinas extra.',
  'Prueba combinar power-ups para llenar el vaso.',
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
        />
      )}
      <AnimatePresence>
        {game.gain > 0 && (
          <motion.div
            key={game.gainKey}
            className="pointer-events-none absolute left-1/2 top-1 z-10 -translate-x-1/2 rounded-full border-2 border-white bg-[#ffd166] px-3 py-0.5 text-sm font-black text-[#8a5a00] shadow-md"
            initial={{ opacity: 0, y: 10, scale: 0.7 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -26 }}
            transition={{ duration: 0.6 }}
          >
            +{game.gain.toLocaleString('es-ES')} propinas
            {game.cascade >= 2 ? ` · ×${game.cascade}` : ''}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const hintLine = (
    <p className="text-center text-[11px] font-bold text-[#7a6a8a]">
      Toca dos fichas vecinas o arrástralas para intercambiarlas
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
      <FreeStatsPanel kinds={cfg.kinds} collected={game.collected} iceLeft={iceLeft} />
    ) : (
      <GoalsPanel goals={goals} compact={compact} />
    );

  const message = free
    ? FREE_LINES[game.turns % FREE_LINES.length]
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
      <div className="mx-auto grid h-full w-full max-w-[1500px] grid-cols-[200px_minmax(0,1fr)_180px] gap-3 p-3 px-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] xl:grid-cols-[minmax(230px,300px)_minmax(0,1fr)_minmax(200px,260px)] xl:gap-4 xl:p-4 xl:px-[max(1rem,env(safe-area-inset-left))] xl:pr-[max(1rem,env(safe-area-inset-right))]">
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
