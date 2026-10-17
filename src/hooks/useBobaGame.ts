import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  addCollected,
  applyPlan,
  bonusForMoves,
  computePlan,
  createGame,
  evaluateGoals,
  findHint,
  goalsDone,
  hasPossibleMove,
  idsAt,
  isAdjacent,
  isEmptyPlan,
  samePos,
  shuffleBoard,
  starsFor,
  trySwap,
} from '../game/logic';
import {
  FALL_MS,
  HINT_DELAY_MS,
  MAX_MULTIPLIER,
  POP_MS,
  SWAP_MS,
} from '../game/constants';
import { sfx } from '../game/sound';
import type {
  ClearPlan,
  GameState,
  GenState,
  GoalStatus,
  LevelConfig,
  LevelResult,
  Pos,
  Status,
} from '../game/types';

const sleep = (ms: number): Promise<void> => new Promise((resolve) => window.setTimeout(resolve, ms));

function playPlanSound(plan: ClearPlan, cascade: number): void {
  const hasTiger = plan.spawns.some((s) => s.special === 'tiger');
  if (hasTiger) {
    sfx.tiger();
  } else if (cascade >= 3) {
    sfx.fever();
  } else if (plan.spawns.length > 0) {
    sfx.special();
  } else {
    sfx.pop(cascade - 1);
  }

  if (plan.hits.length > 0) {
    sfx.crunch();
  }
  if (plan.removed.length >= 10) {
    sfx.boom();
  } else if (plan.removed.length >= 6) {
    sfx.pearls(4);
  }
}

export interface BobaGameApi {
  game: GameState;
  goals: GoalStatus[];
  tap: (p: Pos) => void;
  swap: (a: Pos, b: Pos) => void;
  restart: () => void;
}

/**
 * Máquina de estados del turno. Cada paso es asíncrono (animación),
 * pero todos los cálculos viven en funciones puras de `logic.ts`.
 */
export function useBobaGame(
  cfg: LevelConfig,
  paused: boolean,
  onFinish: (result: LevelResult) => void,
): BobaGameApi {
  const [game, setGame] = useState<GameState>(() => createGame(cfg));
  const gameRef = useRef(game);
  const runRef = useRef(0);
  const pausedRef = useRef(paused);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  const commit = useCallback((next: GameState): void => {
    gameRef.current = next;
    setGame(next);
  }, []);

  const swap = useCallback(
    (a: Pos, b: Pos): void => {
      const s0 = gameRef.current;
      if (s0.busy || s0.status !== 'playing' || pausedRef.current) return;
      if (!isAdjacent(a, b)) {
        commit({ ...s0, selected: null, hint: null });
        return;
      }

      const run = ++runRef.current;
      const alive = (): boolean => runRef.current === run;
      const result = trySwap(s0.board, a, b);

      // Intercambio inválido: se ve el movimiento, rebota y no gasta movimientos.
      if (!result.ok) {
        commit({ ...s0, board: result.board, busy: true, selected: null, hint: null });
        sfx.swap();
        void (async () => {
          await sleep(SWAP_MS);
          if (!alive()) return;
          commit({ ...gameRef.current, board: s0.board, busy: false });
          sfx.invalid();
        })();
        return;
      }

      let board = result.board;
      let gen: GenState = { seed: s0.seed, nextId: s0.nextId };
      let tips = s0.tips;
      let collected = { ...s0.collected };
      let cascade = 0;
      let plan = computePlan(board, result.activated, result.preferred, result.clearAll);
      const movesAfter = s0.movesLeft - 1;

      commit({
        ...s0,
        board,
        movesLeft: movesAfter,
        turns: s0.turns + 1,
        busy: true,
        selected: null,
        hint: null,
        cascade: 0,
        popping: [],
      });
      sfx.swap();

      void (async () => {
        await sleep(SWAP_MS);

        while (alive() && !isEmptyPlan(plan)) {
          cascade += 1;
          const mult = Math.min(MAX_MULTIPLIER, 1 + (cascade - 1) * 0.5);
          const gain = Math.round(plan.points * mult);
          tips += gain;
          collected = addCollected(collected, plan.collected);
          playPlanSound(plan, cascade);

          const poppingIds = idsAt(board, plan.removed);
          commit({
            ...gameRef.current,
            board,
            popping: poppingIds,
            tips,
            collected,
            cascade,
            maxCascade: Math.max(gameRef.current.maxCascade, cascade),
            feverLevel: cascade >= 3 ? cascade : 0,
            gain,
            gainKey: gameRef.current.gainKey + 1,
            busy: true,
          });
          await sleep(POP_MS);
          if (!alive()) return;

          const applied = applyPlan(board, plan, gen, cfg.kinds);
          board = applied.board;
          gen = applied.gen;
          commit({ ...gameRef.current, board, popping: [] });
          await sleep(FALL_MS);
          if (!alive()) return;

          plan = computePlan(board);
        }

        if (!alive()) return;

        if (!hasPossibleMove(board)) {
          const shuffled = shuffleBoard(board, gen);
          board = shuffled.board;
          gen = shuffled.gen;
          commit({ ...gameRef.current, board, hint: null });
          await sleep(FALL_MS);
          if (!alive()) return;
        }

        // Modo libre: no hay objetivos ni límite, la partida nunca termina sola.
        if (cfg.free) {
          commit({
            ...gameRef.current,
            board,
            tips,
            collected,
            seed: gen.seed,
            nextId: gen.nextId,
            popping: [],
            busy: false,
            status: 'playing',
            bonus: 0,
            gain: 0,
            feverLevel: 0,
          });
          return;
        }

        const bestCascade = Math.max(gameRef.current.maxCascade, cascade);
        const statuses = evaluateGoals(
          cfg.goals,
          board,
          collected,
          s0.iceTotal,
          s0.cookieTotal,
          tips,
          bestCascade,
        );
        let status: Status = 'playing';
        let finalTips = tips;
        let bonus = 0;

        if (goalsDone(statuses)) {
          status = 'won';
          bonus = bonusForMoves(movesAfter);
          finalTips += bonus;
        } else if (movesAfter <= 0) {
          status = 'lost';
        }

        commit({
          ...gameRef.current,
          board,
          tips: finalTips,
          collected,
          seed: gen.seed,
          nextId: gen.nextId,
          popping: [],
          busy: false,
          status,
          bonus,
          gain: 0,
          feverLevel: 0,
        });

        if (status === 'won') {
          window.setTimeout(() => sfx.win(), 120);
        } else if (status === 'lost') {
          sfx.lose();
        }

        if (status !== 'playing') {
          onFinishRef.current({
            levelId: cfg.id,
            tips: finalTips,
            stars: starsFor(finalTips, cfg, status === 'won'),
            won: status === 'won',
          });
        }
      })();
    },
    [cfg, commit],
  );

  const tap = useCallback(
    (p: Pos): void => {
      const s = gameRef.current;
      if (s.busy || s.status !== 'playing' || pausedRef.current) return;
      if (!s.selected) {
        sfx.select();
        commit({ ...s, selected: p, hint: null });
        return;
      }
      if (samePos(s.selected, p)) {
        commit({ ...s, selected: null });
        return;
      }
      if (isAdjacent(s.selected, p)) {
        swap(s.selected, p);
        return;
      }
      sfx.select();
      commit({ ...s, selected: p });
    },
    [commit, swap],
  );

  const restart = useCallback((): void => {
    runRef.current += 1;
    commit(createGame(cfg));
  }, [cfg, commit]);

  // Pista automática tras un rato sin movimientos.
  useEffect(() => {
    if (game.busy || game.status !== 'playing' || paused) return;
    const timer = window.setTimeout(() => {
      const s = gameRef.current;
      if (s.busy || s.status !== 'playing') return;
      commit({ ...s, hint: findHint(s.board) });
    }, HINT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [game.board, game.busy, game.status, paused, commit]);

  const goals = useMemo(
    () =>
      evaluateGoals(
        cfg.goals,
        game.board,
        game.collected,
        game.iceTotal,
        game.cookieTotal,
        game.tips,
        game.maxCascade,
      ),
    [
      cfg.goals,
      game.board,
      game.collected,
      game.iceTotal,
      game.cookieTotal,
      game.tips,
      game.maxCascade,
    ],
  );

  return { game, goals, tap, swap, restart };
}
