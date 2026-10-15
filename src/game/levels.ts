import { ALL_KINDS } from './ingredients';
import { LEVEL_COUNT } from './constants';
import type { FreeKindCount, Goal, Kind, LevelConfig } from './types';

export interface ZoneInfo {
  id: number;
  name: string;
  blurb: string;
  from: number;
  to: number;
}

export const ZONES: ZoneInfo[] = [
  { id: 0, name: 'Barra de té', blurb: 'Primeros pedidos, perlas y té suave.', from: 1, to: 10 },
  { id: 1, name: 'Jardín de flores', blurb: 'Hielo, taro y nuevos sabores.', from: 11, to: 20 },
  { id: 2, name: 'Cocina de boba', blurb: 'Pedidos complejos para maestros.', from: 21, to: 30 },
];

export { LEVEL_COUNT };

export function zoneOf(id: number): number {
  const zone = ZONES.find((z) => id >= z.from && id <= z.to);
  return zone?.id ?? ZONES.length - 1;
}

/**
 * Genera la configuración de un nivel de forma determinista.
 * Dificultad creciente: más ingredientes, más hielo, menos movimientos.
 */
export function buildLevel(id: number): LevelConfig {
  const zone = zoneOf(id);
  const kindCount = zone === 0 ? 4 : zone === 1 ? 5 : 6;
  const kinds: Kind[] = ALL_KINDS.slice(0, kindCount);

  const hasIce = id >= 5 && id % 4 === 1;
  const hasDouble = id >= 12 && id % 6 === 0;

  const goals: Goal[] = [];
  let moves = Math.max(16, 22 - Math.floor((id - 1) / 8));
  let ice: LevelConfig['ice'] = null;

  if (hasIce) {
    const count = 4 + Math.floor(id / 6);
    const layers: 1 | 2 = id >= 17 ? 2 : 1;
    ice = { count, layers };
    goals.push({ type: 'ice', target: count * layers });
    moves += 4;
    if (id >= 17) {
      const kind = kinds[(id + 1) % kinds.length] as Kind;
      goals.push({ type: 'collect', kind, target: Math.min(20, 10 + Math.floor(id / 2)) });
    }
  } else if (hasDouble) {
    const base = Math.min(22, 12 + Math.floor(id * 0.5));
    const first = kinds[0] as Kind;
    const second = kinds[kinds.length - 1] as Kind;
    goals.push({ type: 'collect', kind: first, target: Math.floor(base * 0.6) });
    goals.push({ type: 'collect', kind: second, target: Math.floor(base * 0.6) });
    moves += 2;
  } else {
    const kind = kinds[id % kinds.length] as Kind;
    goals.push({ type: 'collect', kind, target: Math.min(30, 12 + Math.floor(id * 0.7)) });
  }

  if (id >= 20) moves += 3;

  return {
    id,
    zone,
    title: `Pedido #${id}`,
    rows: 8,
    cols: 8,
    moves,
    kinds,
    goals,
    ice,
    thresholds: { two: 800 + id * 120, three: 1500 + id * 200 },
    seed: id * 9973 + 17,
  };
}

export interface FreeOptions {
  kinds: FreeKindCount;
  ice: boolean;
  seed: number;
}

/** Tablero del modo libre: sin pedidos, sin límite de movimientos y sin final. */
export function buildFreeLevel(opts: FreeOptions): LevelConfig {
  return {
    id: 0,
    zone: 0,
    title: 'Modo libre',
    rows: 8,
    cols: 8,
    moves: Number.POSITIVE_INFINITY,
    kinds: ALL_KINDS.slice(0, opts.kinds),
    goals: [],
    ice: opts.ice ? { count: 6, layers: 1 } : null,
    thresholds: { two: 0, three: 0 },
    seed: opts.seed,
    free: true,
  };
}

export function isZoneStart(id: number): boolean {
  return ZONES.some((z) => z.from === id);
}
