import { BONUS_PER_MOVE } from './constants';
import type {
  Board,
  ClearPlan,
  GameState,
  GenState,
  Goal,
  GoalStatus,
  Kind,
  LevelConfig,
  Pos,
  Special,
  SwapResult,
  Tile,
} from './types';

/* -------------------------------------------------------------------------- */
/*                          Aleatorio determinista                            */
/* -------------------------------------------------------------------------- */

/** Mulberry32 en forma pura: devuelve un valor en [0,1) y la nueva semilla. */
export function nextRandom(seed: number): { value: number; seed: number } {
  const s = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(s ^ (s >>> 15), 1 | s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return { value: ((t ^ (t >>> 14)) >>> 0) / 4294967296, seed: s };
}

export function rand(gen: GenState): { value: number; gen: GenState } {
  const r = nextRandom(gen.seed);
  return { value: r.value, gen: { ...gen, seed: r.seed } };
}

function shuffleArray<T>(items: readonly T[], gen: GenState): { items: T[]; gen: GenState } {
  const out = [...items];
  let g = gen;
  for (let i = out.length - 1; i > 0; i--) {
    const roll = rand(g);
    g = roll.gen;
    const j = Math.floor(roll.value * (i + 1));
    const tmp = out[i] as T;
    out[i] = out[j] as T;
    out[j] = tmp;
  }
  return { items: out, gen: g };
}

/* -------------------------------------------------------------------------- */
/*                                  Utilidades                                */
/* -------------------------------------------------------------------------- */

export const keyOf = (p: Pos): string => `${p.r},${p.c}`;
export const samePos = (a: Pos, b: Pos): boolean => a.r === b.r && a.c === b.c;
export const isAdjacent = (a: Pos, b: Pos): boolean =>
  Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;

const DIRS: ReadonlyArray<readonly [number, number]> = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

export function rowsOf(board: Board): number {
  return board.length;
}

export function colsOf(board: Board): number {
  return board[0]?.length ?? 0;
}

function inBounds(board: Board, r: number, c: number): boolean {
  return r >= 0 && c >= 0 && r < rowsOf(board) && c < colsOf(board);
}

function swapCells(board: Board, a: Pos, b: Pos): Board {
  const next = board.map((row) => [...row]);
  const row_a = next[a.r];
  const row_b = next[b.r];
  if (!row_a || !row_b) return board;
  const ta = row_a[a.c];
  const tb = row_b[b.c];
  if (!ta || !tb) return board;
  row_a[a.c] = tb;
  row_b[b.c] = ta;
  return next;
}

export function tileAt(board: Board, p: Pos): Tile | undefined {
  return board[p.r]?.[p.c];
}

export function iceRemaining(board: Board): number {
  let total = 0;
  for (const row of board) for (const t of row) total += t.ice;
  return total;
}

export function cookieRemaining(board: Board): number {
  let total = 0;
  for (const row of board) for (const t of row) total += t.cookie ?? 0;
  return total;
}

/* -------------------------------------------------------------------------- */
/*                              Búsqueda de combinaciones                     */
/* -------------------------------------------------------------------------- */

export interface Run {
  dir: 'h' | 'v';
  cells: Pos[];
}

/** Una ficha puede combinarse si está libre de hielo, galleta y no es un arcoíris suelto. */
function isMatchable(t: Tile | undefined): t is Tile {
  return !!t && t.ice === 0 && (!t.cookie || t.cookie === 0) && t.special !== 'rainbow';
}

export function findRuns(board: Board): Run[] {
  const runs: Run[] = [];
  const rows = rowsOf(board);
  const cols = colsOf(board);

  for (let r = 0; r < rows; r++) {
    let c = 0;
    while (c < cols) {
      const t = board[r]?.[c];
      if (!isMatchable(t)) {
        c++;
        continue;
      }
      let e = c + 1;
      while (e < cols) {
        const n = board[r]?.[e];
        if (!isMatchable(n) || n.kind !== t.kind) break;
        e++;
      }
      if (e - c >= 3) {
        const cells: Pos[] = [];
        for (let cc = c; cc < e; cc++) cells.push({ r, c: cc });
        runs.push({ dir: 'h', cells });
      }
      c = e;
    }
  }

  for (let c = 0; c < cols; c++) {
    let r = 0;
    while (r < rows) {
      const t = board[r]?.[c];
      if (!isMatchable(t)) {
        r++;
        continue;
      }
      let e = r + 1;
      while (e < rows) {
        const n = board[e]?.[c];
        if (!isMatchable(n) || n.kind !== t.kind) break;
        e++;
      }
      if (e - r >= 3) {
        const cells: Pos[] = [];
        for (let rr = r; rr < e; rr++) cells.push({ r: rr, c });
        runs.push({ dir: 'v', cells });
      }
      r = e;
    }
  }

  return runs;
}

/* -------------------------------------------------------------------------- */
/*                                   Intercambio                              */
/* -------------------------------------------------------------------------- */

/**
 * Intenta intercambiar dos fichas. Válido si forma una combinación o si activa
 * un power-up. Devuelve el tablero ya intercambiado (para animarlo) y los datos
 * necesarios para resolver el turno.
 */
export function trySwap(board: Board, a: Pos, b: Pos): SwapResult {
  const invalid: SwapResult = {
    ok: false,
    board: swapCells(board, a, b),
    activated: [],
    preferred: b,
    clearAll: false,
  };
  if (!isAdjacent(a, b)) return { ...invalid, board };

  const ta = tileAt(board, a);
  const tb = tileAt(board, b);
  if (!ta || !tb) return { ...invalid, board };
  if (ta.ice > 0 || (ta.cookie && ta.cookie > 0) || tb.ice > 0 || (tb.cookie && tb.cookie > 0)) {
    return { ...invalid, board };
  }

  const swapped = swapCells(board, a, b);
  const sa = ta.special !== 'none' ? ta.special : 'none';
  const sb = tb.special !== 'none' ? tb.special : 'none';

  // Dos arcoíris: limpian todo el tablero.
  if (sa === 'rainbow' && sb === 'rainbow') {
    return { ok: true, board: swapped, activated: [b], preferred: b, clearAll: true };
  }

  // Arcoíris + Tiger Boba o power-up: super explosión temática
  if ((sa === 'rainbow' && sb === 'tiger') || (sa === 'tiger' && sb === 'rainbow')) {
    return { ok: true, board: swapped, activated: [a, b], preferred: b, clearAll: true };
  }

  // Arcoíris + ingrediente: elimina todas las fichas de ese ingrediente.
  if (sa === 'rainbow' || sb === 'rainbow') {
    const rainbowAfter = sa === 'rainbow' ? b : a;
    const other = sa === 'rainbow' ? tb : ta;
    const row = swapped[rainbowAfter.r];
    const rainbowTile = row?.[rainbowAfter.c];
    if (row && rainbowTile) {
      row[rainbowAfter.c] = { ...rainbowTile, kind: other.kind };
    }
    return {
      ok: true,
      board: swapped,
      activated: [rainbowAfter],
      preferred: b,
      clearAll: false,
    };
  }

  // Combinación de dos power-ups
  if (sa !== 'none' && sb !== 'none') {
    return { ok: true, board: swapped, activated: [a, b], preferred: b, clearAll: false };
  }

  // Power-up normal: se activa al intercambiarse.
  if (sa !== 'none' || sb !== 'none') {
    const activated: Pos[] = [];
    if (sa !== 'none') activated.push(b);
    if (sb !== 'none') activated.push(a);
    return { ok: true, board: swapped, activated, preferred: b, clearAll: false };
  }

  // Intercambio normal: debe formar una combinación.
  const ok = findRuns(swapped).length > 0;
  return { ok, board: swapped, activated: [], preferred: b, clearAll: false };
}

export function findHint(board: Board): [Pos, Pos] | null {
  const rows = rowsOf(board);
  const cols = colsOf(board);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const a = { r, c };
      for (const [dr, dc] of [
        [0, 1],
        [1, 0],
      ] as const) {
        const b = { r: r + dr, c: c + dc };
        if (!inBounds(board, b.r, b.c)) continue;
        if (trySwap(board, a, b).ok) return [a, b];
      }
    }
  }
  return null;
}

export function hasPossibleMove(board: Board): boolean {
  return findHint(board) !== null;
}

/* -------------------------------------------------------------------------- */
/*                         Cálculo de eliminación (plan)                      */
/* -------------------------------------------------------------------------- */

const SPECIAL_PRIORITY: Record<Special, number> = {
  none: 0,
  'striped-h': 1,
  'striped-v': 1,
  bomb: 2,
  tiger: 3,
  rainbow: 4,
};

function pickSpawnPos(run: Run, preferred: Pos | null): Pos {
  if (preferred && run.cells.some((p) => samePos(p, preferred))) return preferred;
  return run.cells[Math.floor(run.cells.length / 2)] ?? (run.cells[0] as Pos);
}

/**
 * Calcula qué se elimina en un paso: combinaciones, power-ups activados,
 * power-ups creados, hielo y galletas golpeadas y puntos. Función pura.
 */
export function computePlan(
  board: Board,
  activated: Pos[] = [],
  preferred: Pos | null = null,
  clearAll = false,
): ClearPlan {
  const rows = rowsOf(board);
  const cols = colsOf(board);
  const runs = findRuns(board);

  const remove = new Map<string, Pos>();
  const hits = new Map<string, Pos>();
  const queue: Pos[] = [];
  let specialCount = 0;

  const add = (p: Pos): void => {
    const t = tileAt(board, p);
    if (!t) return;
    const k = keyOf(p);
    if (t.ice > 0 || (t.cookie && t.cookie > 0)) {
      if (!hits.has(k)) hits.set(k, p);
      return;
    }
    if (remove.has(k)) return;
    remove.set(k, p);
    if (t.special !== 'none') queue.push(p);
  };

  if (clearAll) {
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) add({ r, c });
  }
  for (const p of activated) add(p);
  for (const run of runs) for (const p of run.cells) add(p);

  // Power-ups que se crean con las combinaciones.
  const spawns = new Map<string, ClearPlan['spawns'][number]>();
  const setSpawn = (p: Pos, special: Special): void => {
    const t = tileAt(board, p);
    if (!t) return;
    const k = keyOf(p);
    const cur = spawns.get(k);
    if (cur && SPECIAL_PRIORITY[cur.special] >= SPECIAL_PRIORITY[special]) return;
    spawns.set(k, { r: p.r, c: p.c, special, kind: t.kind });
  };

  for (const run of runs) {
    const len = run.cells.length;
    let special: Special | null = null;
    if (len >= 5) special = 'rainbow';
    else if (len === 4) special = run.dir === 'h' ? 'striped-v' : 'striped-h';
    if (special) setSpawn(pickSpawnPos(run, preferred), special);
  }

  const horizontal = runs.filter((r) => r.dir === 'h');
  const vertical = runs.filter((r) => r.dir === 'v');
  for (const h of horizontal) {
    for (const v of vertical) {
      const inter = h.cells.find((p) => v.cells.some((q) => samePos(p, q)));
      if (inter) {
        // Intersección de 5 o más: Tiger Boba swirl! De lo contrario bomba normal.
        if (h.cells.length + v.cells.length >= 6) {
          setSpawn(inter, 'tiger');
        } else {
          setSpawn(inter, 'bomb');
        }
      }
    }
  }

  // Las celdas donde nace un power-up no se eliminan: la ficha se transforma.
  for (const k of spawns.keys()) remove.delete(k);

  // Expansión de power-ups activados (en cadena).
  for (let qi = 0; qi < queue.length; qi++) {
    const p = queue[qi] as Pos;
    const t = tileAt(board, p);
    if (!t) continue;
    specialCount++;
    switch (t.special) {
      case 'striped-h':
        for (let c = 0; c < cols; c++) add({ r: p.r, c });
        break;
      case 'striped-v':
        for (let r = 0; r < rows; r++) add({ r, c: p.c });
        break;
      case 'bomb':
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const r = p.r + dr;
            const c = p.c + dc;
            if (inBounds(board, r, c)) add({ r, c });
          }
        }
        break;
      case 'tiger':
        // Tiger Boba: 3 filas y 3 columnas completas en cruz gigante + diagonales
        for (let dr = -1; dr <= 1; dr++) {
          for (let c = 0; c < cols; c++) {
            const r = p.r + dr;
            if (inBounds(board, r, c)) add({ r, c });
          }
        }
        for (let dc = -1; dc <= 1; dc++) {
          for (let r = 0; r < rows; r++) {
            const c = p.c + dc;
            if (inBounds(board, r, c)) add({ r, c });
          }
        }
        for (let d = -2; d <= 2; d++) {
          if (inBounds(board, p.r + d, p.c + d)) add({ r: p.r + d, c: p.c + d });
          if (inBounds(board, p.r + d, p.c - d)) add({ r: p.r + d, c: p.c - d });
        }
        break;
      case 'rainbow':
        if (!clearAll) {
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const cell = tileAt(board, { r, c });
              if (cell && cell.kind === t.kind) add({ r, c });
            }
          }
        }
        break;
      default:
        break;
    }
  }

  // Hielo y galletas vecinos a una eliminación se golpean una capa
  for (const p of remove.values()) {
    for (const [dr, dc] of DIRS) {
      const r = p.r + dr;
      const c = p.c + dc;
      if (!inBounds(board, r, c)) continue;
      const k = `${r},${c}`;
      const t = tileAt(board, { r, c });
      if (t && (t.ice > 0 || (t.cookie && t.cookie > 0)) && !remove.has(k) && !hits.has(k)) {
        hits.set(k, { r, c });
      }
    }
  }

  const collected: Partial<Record<Kind, number>> = {};
  for (const p of remove.values()) {
    const t = tileAt(board, p);
    if (!t) continue;
    collected[t.kind] = (collected[t.kind] ?? 0) + 1;
  }

  let points = remove.size * 12 + specialCount * 50 + hits.size * 30;
  for (const run of runs) {
    const len = run.cells.length;
    points += len >= 5 ? 120 : len === 4 ? 70 : 35;
  }

  return {
    removed: [...remove.values()],
    hits: [...hits.values()],
    spawns: [...spawns.values()],
    collected,
    points,
  };
}

export function isEmptyPlan(plan: ClearPlan): boolean {
  return plan.removed.length === 0 && plan.hits.length === 0;
}

/** Aplica un plan: elimina, transforma, rompe hielo / galletas, hace caer y rellena. */
export function applyPlan(
  board: Board,
  plan: ClearPlan,
  gen: GenState,
  kinds: readonly Kind[],
): { board: Board; gen: GenState } {
  const rows = rowsOf(board);
  const cols = colsOf(board);
  const removed = new Set(plan.removed.map(keyOf));
  const hitSet = new Set(plan.hits.map(keyOf));
  const spawnMap = new Map<string, ClearPlan['spawns'][number]>();
  for (const s of plan.spawns) spawnMap.set(`${s.r},${s.c}`, s);

  const cells: (Tile | null)[][] = board.map((row, r) =>
    row.map((t, c) => {
      const k = `${r},${c}`;
      if (removed.has(k)) return null;
      let tile: Tile = t;
      const spawn = spawnMap.get(k);
      if (spawn) tile = { ...tile, special: spawn.special, kind: spawn.kind };
      if (hitSet.has(k)) {
        const ice = Math.max(0, tile.ice - 1);
        const cookie = tile.cookie ? Math.max(0, tile.cookie - 1) : 0;
        tile = { ...tile, ice, cookie };
      }
      return tile;
    }),
  );

  let next = gen;
  const out: Board = Array.from({ length: rows }, () => new Array<Tile>(cols));

  for (let c = 0; c < cols; c++) {
    const stack: Tile[] = [];
    for (let r = rows - 1; r >= 0; r--) {
      const t = cells[r]?.[c];
      if (t) stack.push(t);
    }
    let r = rows - 1;
    for (const t of stack) {
      const row = out[r];
      if (row) row[c] = t;
      r--;
    }
    while (r >= 0) {
      const roll = rand(next);
      next = roll.gen;
      const kind = kinds[Math.floor(roll.value * kinds.length)] ?? (kinds[0] as Kind);
      const id = next.nextId;
      next = { ...next, nextId: next.nextId + 1 };
      const row = out[r];
      if (row) row[c] = { id, kind, special: 'none', ice: 0, cookie: 0 };
      r--;
    }
  }

  return { board: out, gen: next };
}

/* -------------------------------------------------------------------------- */
/*                         Creación y barajado del tablero                    */
/* -------------------------------------------------------------------------- */

export function createBoard(cfg: LevelConfig): { board: Board; gen: GenState } {
  let result: { board: Board; gen: GenState } | null = null;

  for (let attempt = 0; attempt < 60; attempt++) {
    let gen: GenState = { seed: cfg.seed + attempt * 7919, nextId: 1 };
    const grid: Board = [];

    for (let r = 0; r < cfg.rows; r++) {
      const row: Tile[] = [];
      for (let c = 0; c < cfg.cols; c++) {
        const forbidden: Kind[] = [];
        const left1 = row[c - 1];
        const left2 = row[c - 2];
        if (left1 && left2 && left1.kind === left2.kind) forbidden.push(left1.kind);
        const up1 = grid[r - 1]?.[c];
        const up2 = grid[r - 2]?.[c];
        if (up1 && up2 && up1.kind === up2.kind) forbidden.push(up1.kind);

        const options = cfg.kinds.filter((k) => !forbidden.includes(k));
        const roll = rand(gen);
        gen = roll.gen;
        const kind = options[Math.floor(roll.value * options.length)] ?? (cfg.kinds[0] as Kind);
        const id = gen.nextId;
        gen = { ...gen, nextId: gen.nextId + 1 };
        row.push({ id, kind, special: 'none', ice: 0, cookie: 0 });
      }
      grid.push(row);
    }

    const occupied = new Set<string>();

    if (cfg.ice) {
      const positions: Pos[] = [];
      for (let r = 0; r < cfg.rows; r++) for (let c = 0; c < cfg.cols; c++) positions.push({ r, c });
      const shuffled = shuffleArray(positions, gen);
      gen = shuffled.gen;
      for (const p of shuffled.items.slice(0, cfg.ice.count)) {
        const row = grid[p.r];
        const t = row?.[p.c];
        if (row && t) {
          row[p.c] = { ...t, ice: cfg.ice.layers };
          occupied.add(keyOf(p));
        }
      }
    }

    if (cfg.cookie) {
      const positions: Pos[] = [];
      for (let r = 0; r < cfg.rows; r++) {
        for (let c = 0; c < cfg.cols; c++) {
          const p = { r, c };
          if (!occupied.has(keyOf(p))) positions.push(p);
        }
      }
      const shuffled = shuffleArray(positions, gen);
      gen = shuffled.gen;
      for (const p of shuffled.items.slice(0, cfg.cookie.count)) {
        const row = grid[p.r];
        const t = row?.[p.c];
        if (row && t) {
          row[p.c] = { ...t, cookie: cfg.cookie.layers };
          occupied.add(keyOf(p));
        }
      }
    }

    result = { board: grid, gen };
    if (hasPossibleMove(grid)) break;
  }

  return result ?? { board: [], gen: { seed: cfg.seed, nextId: 1 } };
}

/** Reparte las fichas existentes en nuevas posiciones hasta que no haya combinaciones previas. */
export function shuffleBoard(board: Board, gen: GenState): { board: Board; gen: GenState } {
  const rows = rowsOf(board);
  const cols = colsOf(board);
  let g = gen;
  for (let attempt = 0; attempt < 40; attempt++) {
    const shuffled = shuffleArray(board.flat(), g);
    g = shuffled.gen;
    const candidate: Board = [];
    let i = 0;
    for (let r = 0; r < rows; r++) {
      const row: Tile[] = [];
      for (let c = 0; c < cols; c++) {
        row.push(shuffled.items[i] as Tile);
        i++;
      }
      candidate.push(row);
    }
    if (findRuns(candidate).length === 0 && hasPossibleMove(candidate)) {
      return { board: candidate, gen: g };
    }
  }
  return { board, gen: g };
}

/* -------------------------------------------------------------------------- */
/*                               Objetivos y estrellas                        */
/* -------------------------------------------------------------------------- */

export function evaluateGoals(
  goals: readonly Goal[],
  board: Board,
  collected: Partial<Record<Kind, number>>,
  iceTotal: number,
  cookieTotal = 0,
  tips = 0,
  maxCascade = 0,
): GoalStatus[] {
  return goals.map((goal) => {
    switch (goal.type) {
      case 'collect': {
        const current = Math.min(collected[goal.kind] ?? 0, goal.target);
        return { goal, current, target: goal.target, done: current >= goal.target };
      }
      case 'cookie': {
        const broken = Math.max(0, cookieTotal - cookieRemaining(board));
        const current = Math.min(broken, goal.target);
        return { goal, current, target: goal.target, done: current >= goal.target };
      }
      case 'tips': {
        const current = Math.min(tips, goal.target);
        return { goal, current, target: goal.target, done: current >= goal.target };
      }
      case 'combo': {
        const current = Math.min(maxCascade, goal.target);
        return { goal, current, target: goal.target, done: current >= goal.target };
      }
      case 'ice':
      default: {
        const broken = Math.max(0, iceTotal - iceRemaining(board));
        const current = Math.min(broken, goal.target);
        return { goal, current, target: goal.target, done: current >= goal.target };
      }
    }
  });
}

export function goalsDone(statuses: readonly GoalStatus[]): boolean {
  return statuses.every((s) => s.done);
}

export function starsFor(tips: number, cfg: LevelConfig, won: boolean): number {
  if (!won) return 0;
  if (tips >= cfg.thresholds.three) return 3;
  if (tips >= cfg.thresholds.two) return 2;
  return 1;
}

export function bonusForMoves(movesLeft: number): number {
  return Math.max(0, movesLeft) * BONUS_PER_MOVE;
}

export function countIce(board: Board): number {
  return iceRemaining(board);
}

export function countCookie(board: Board): number {
  return cookieRemaining(board);
}

/** Estado inicial de una partida (función pura). */
export function createGame(cfg: LevelConfig): GameState {
  const { board, gen } = createBoard(cfg);
  return {
    board,
    movesLeft: cfg.moves,
    tips: 0,
    collected: {},
    iceTotal: countIce(board),
    cookieTotal: countCookie(board),
    popping: [],
    cascade: 0,
    gain: 0,
    gainKey: 0,
    busy: false,
    status: 'playing',
    seed: gen.seed,
    nextId: gen.nextId,
    selected: null,
    hint: null,
    bonus: 0,
    turns: 0,
    maxCascade: 0,
    feverLevel: 0,
  };
}

export function idsAt(board: Board, positions: readonly Pos[]): number[] {
  const ids: number[] = [];
  for (const p of positions) {
    const t = tileAt(board, p);
    if (t) ids.push(t.id);
  }
  return ids;
}

export function addCollected(
  base: Partial<Record<Kind, number>>,
  extra: Partial<Record<Kind, number>>,
): Partial<Record<Kind, number>> {
  const out: Partial<Record<Kind, number>> = { ...base };
  for (const k of Object.keys(extra) as Kind[]) {
    out[k] = (out[k] ?? 0) + (extra[k] ?? 0);
  }
  return out;
}
