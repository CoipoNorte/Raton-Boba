import { STORAGE_VERSION } from './constants';
import type { FreeKindCount } from './types';

/**
 * Persistencia versionada. El resto del juego sólo usa `loadSave` / `saveSave`,
 * así que migrar a IndexedDB sólo requiere cambiar el backend de abajo.
 */

export interface FreePrefs {
  kinds: FreeKindCount;
  ice: boolean;
  cookie?: boolean;
}

export interface SaveData {
  version: number;
  /** Estrellas por nivel (clave = número de nivel). */
  stars: Record<string, number>;
  /** Propinas totales acumuladas en todas las partidas. */
  totalTips: number;
  /** Mejor puntaje por nivel. */
  bestTips: Record<string, number>;
  soundOn: boolean;
  /** Mejor propina total de una sola sesión libre. */
  freeBest: number;
  /** Mejor cascada alcanzada en modo libre. */
  freeBestCombo: number;
  /** Número de sesiones libres terminadas. */
  freeSessions: number;
  /** Últimas opciones elegidas en el lobby del modo libre. */
  freePrefs: FreePrefs;
}

export interface KeyValueBackend {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

const SAVE_KEY = `raton-boba:v${STORAGE_VERSION}:save`;

export function defaultSave(): SaveData {
  return {
    version: STORAGE_VERSION,
    stars: {},
    totalTips: 0,
    bestTips: {},
    soundOn: true,
    freeBest: 0,
    freeBestCombo: 0,
    freeSessions: 0,
    freePrefs: { kinds: 4, ice: false, cookie: false },
  };
}

function createMemoryBackend(): KeyValueBackend {
  const map = new Map<string, string>();
  return {
    get: (key) => map.get(key) ?? null,
    set: (key, value) => {
      map.set(key, value);
    },
    remove: (key) => {
      map.delete(key);
    },
  };
}

function createLocalBackend(): KeyValueBackend | null {
  try {
    const ls = window.localStorage;
    const probe = '__raton_boba_probe__';
    ls.setItem(probe, '1');
    ls.removeItem(probe);
    return {
      get: (key) => ls.getItem(key),
      set: (key, value) => ls.setItem(key, value),
      remove: (key) => ls.removeItem(key),
    };
  } catch {
    // Modo incógnito, almacenamiento bloqueado o cuota llena.
    return null;
  }
}

let backend: KeyValueBackend = createLocalBackend() ?? createMemoryBackend();

/** Permite cambiar el almacenamiento (p. ej. IndexedDB) sin tocar el juego. */
export function setStorageBackend(next: KeyValueBackend): void {
  backend = next;
}

function sanitizeNumberRecord(value: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (typeof v === 'number' && Number.isFinite(v) && v >= 0) out[k] = Math.floor(v);
    }
  }
  return out;
}

function nonNegativeInt(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
}

function sanitizeFreePrefs(value: unknown): FreePrefs {
  if (!value || typeof value !== 'object') return { kinds: 4, ice: false, cookie: false };
  const v = value as Partial<Record<keyof FreePrefs, unknown>>;
  const kinds: FreeKindCount = v.kinds === 5 ? 5 : v.kinds === 6 ? 6 : 4;
  return {
    kinds,
    ice: typeof v.ice === 'boolean' ? v.ice : false,
    cookie: typeof v.cookie === 'boolean' ? v.cookie : false,
  };
}

export function sanitizeSave(raw: unknown): SaveData {
  const base = defaultSave();
  if (!raw || typeof raw !== 'object') return base;
  const data = raw as Partial<Record<keyof SaveData, unknown>>;
  return {
    version: STORAGE_VERSION,
    stars: sanitizeNumberRecord(data.stars),
    totalTips: typeof data.totalTips === 'number' && data.totalTips >= 0 ? Math.floor(data.totalTips) : 0,
    bestTips: sanitizeNumberRecord(data.bestTips),
    soundOn: typeof data.soundOn === 'boolean' ? data.soundOn : base.soundOn,
    freeBest: nonNegativeInt(data.freeBest),
    freeBestCombo: nonNegativeInt(data.freeBestCombo),
    freeSessions: nonNegativeInt(data.freeSessions),
    freePrefs: sanitizeFreePrefs(data.freePrefs),
  };
}

export function loadSave(): SaveData {
  try {
    const raw = backend.get(SAVE_KEY);
    if (!raw) return defaultSave();
    return sanitizeSave(JSON.parse(raw));
  } catch {
    return defaultSave();
  }
}

export function saveSave(data: SaveData): void {
  try {
    backend.set(SAVE_KEY, JSON.stringify(data));
  } catch {
    // Si falla el guardado, el juego sigue funcionando en memoria.
  }
}

export function clearSave(): void {
  try {
    backend.remove(SAVE_KEY);
  } catch {
    // Ignorado a propósito.
  }
}
