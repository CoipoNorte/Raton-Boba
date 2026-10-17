/** Ingredientes que se pueden combinar en el tablero. */
export type Kind = 'perla' | 'mango' | 'fresa' | 'matcha' | 'taro' | 'leche';

/** Power-ups que aparecen al hacer combinaciones grandes o en niveles avanzados. */
export type Special = 'none' | 'striped-h' | 'striped-v' | 'bomb' | 'rainbow' | 'tiger';

export interface Pos {
  r: number;
  c: number;
}

export interface Tile {
  /** Identificador estable: permite animar la ficha mientras cae o se mueve. */
  id: number;
  kind: Kind;
  special: Special;
  /** Capas de hielo (0 = libre). Una ficha con hielo no puede combinarse. */
  ice: number;
  /** Capas de galleta crujiente (0 = sin galleta). Se rompe con combinaciones adyacentes. */
  cookie?: number;
}

export type Board = Tile[][];

export type Goal =
  | { type: 'collect'; kind: Kind; target: number }
  | { type: 'ice'; target: number }
  | { type: 'cookie'; target: number }
  /** Alcanzar una cantidad de propinas durante el pedido. */
  | { type: 'tips'; target: number }
  /** Encadenar una cascada de al menos N niveles. */
  | { type: 'combo'; target: number };

export interface IceSpec {
  count: number;
  layers: 1 | 2;
}

export interface CookieSpec {
  count: number;
  layers: 1 | 2;
}

export interface StarThresholds {
  two: number;
  three: number;
}

export interface LevelConfig {
  id: number;
  zone: number;
  title: string;
  rows: number;
  cols: number;
  moves: number;
  kinds: Kind[];
  goals: Goal[];
  ice: IceSpec | null;
  cookie?: CookieSpec | null;
  thresholds: StarThresholds;
  seed: number;
  /** Modo libre: sin objetivos, sin límite de movimientos y sin final de partida. */
  free?: boolean;
}

export interface GenState {
  seed: number;
  nextId: number;
}

export interface Spawn {
  r: number;
  c: number;
  special: Special;
  kind: Kind;
}

/** Resultado puro de calcular qué se elimina en un paso. */
export interface ClearPlan {
  removed: Pos[];
  hits: Pos[];
  spawns: Spawn[];
  collected: Partial<Record<Kind, number>>;
  points: number;
}

export interface SwapResult {
  ok: boolean;
  board: Board;
  activated: Pos[];
  preferred: Pos;
  clearAll: boolean;
}

export type Status = 'playing' | 'won' | 'lost';

export interface GameState {
  board: Board;
  movesLeft: number;
  tips: number;
  collected: Partial<Record<Kind, number>>;
  iceTotal: number;
  cookieTotal: number;
  popping: number[];
  cascade: number;
  gain: number;
  gainKey: number;
  busy: boolean;
  status: Status;
  seed: number;
  nextId: number;
  selected: Pos | null;
  hint: [Pos, Pos] | null;
  bonus: number;
  /** Jugadas válidas realizadas (sobre todo útil en modo libre). */
  turns: number;
  /** Mayor cascada alcanzada en la partida. */
  maxCascade: number;
  /** Si se activó una explosión mayor o combo fiebre para efectos estimulantes. */
  feverLevel?: number;
}

/** Número de sabores disponibles en el modo libre. */
export type FreeKindCount = 4 | 5 | 6;

/** Resumen de una sesión libre al terminarla. */
export interface FreeSummary {
  tips: number;
  bestCombo: number;
  turns: number;
  served: number;
}

export interface GoalStatus {
  goal: Goal;
  current: number;
  target: number;
  done: boolean;
}

export interface LevelResult {
  levelId: number;
  tips: number;
  stars: number;
  won: boolean;
}
