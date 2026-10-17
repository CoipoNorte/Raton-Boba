import { ALL_KINDS } from './ingredients';
import { LEVEL_COUNT } from './constants';
import type { CookieSpec, FreeKindCount, Goal, IceSpec, Kind, LevelConfig } from './types';

/** Identificador del decorado ilustrado que usa cada zona en el mapa. */
export type SceneKind =
  | 'tea'
  | 'sakura'
  | 'tiger'
  | 'taro'
  | 'lab'
  | 'market'
  | 'coast'
  | 'ice'
  | 'fireworks'
  | 'temple'
  | 'bamboo'
  | 'honey'
  | 'galaxy'
  | 'volcano'
  | 'orchard'
  | 'cave'
  | 'sky'
  | 'carnival'
  | 'aurora'
  | 'royal';

export interface ZoneInfo {
  id: number;
  name: string;
  /** Nombre corto para cabeceras estrechas. */
  short: string;
  blurb: string;
  from: number;
  to: number;
  accent: string;
  badge: string;
  scene: SceneKind;
  /** Degradado del cielo de la región (arriba, abajo). */
  sky: [string, string];
  /** Color del suelo / islas flotantes. */
  ground: string;
}

export const ZONES: ZoneInfo[] = [
  {
    id: 0,
    name: 'Barra de té tradicional',
    short: 'Barra de té',
    blurb: 'Primeros pedidos, perlas suaves y té Assam.',
    from: 1,
    to: 10,
    accent: '#7d62c9',
    badge: '🧋',
    scene: 'tea',
    sky: ['#f3ecff', '#fff6e6'],
    ground: '#d8c3a0',
  },
  {
    id: 1,
    name: 'Jardín de sakura & matcha',
    short: 'Jardín sakura',
    blurb: 'Hielo primaveral, matcha y pedidos dobles.',
    from: 11,
    to: 20,
    accent: '#4f8f4a',
    badge: '🌸',
    scene: 'sakura',
    sky: ['#ffeef4', '#eef9e4'],
    ground: '#a8cf8a',
  },
  {
    id: 2,
    name: 'Cocina Tiger Boba',
    short: 'Cocina Tiger',
    blurb: 'Azúcar morena chorreada, bombas tigre y calor.',
    from: 21,
    to: 30,
    accent: '#c9772a',
    badge: '🐯',
    scene: 'tiger',
    sky: ['#fff0dc', '#ffe3c2'],
    ground: '#d9a066',
  },
  {
    id: 3,
    name: 'Noche de taro & toppings',
    short: 'Noche de taro',
    blurb: 'Galleta crujiente, taro morado y estrellas.',
    from: 31,
    to: 40,
    accent: '#9655d9',
    badge: '🍪',
    scene: 'taro',
    sky: ['#e7dcff', '#f6ecff'],
    ground: '#b68ae0',
  },
  {
    id: 4,
    name: 'Laboratorio Maestro Boba',
    short: 'Laboratorio',
    blurb: 'Matraces burbujeantes y arcoíris legendarios.',
    from: 41,
    to: 50,
    accent: '#d99014',
    badge: '✨',
    scene: 'lab',
    sky: ['#fff8e0', '#eef6ff'],
    ground: '#cfd9e8',
  },
  {
    id: 5,
    name: 'Mercado nocturno de farolillos',
    short: 'Mercado nocturno',
    blurb: 'Puestos callejeros, vapor y mil farolillos rojos.',
    from: 51,
    to: 60,
    accent: '#e0517d',
    badge: '🏮',
    scene: 'market',
    sky: ['#ffe4ec', '#ffeede'],
    ground: '#e08aa0',
  },
  {
    id: 6,
    name: 'Costa de sal marina & yuzu',
    short: 'Costa de yuzu',
    blurb: 'Foam salado, olas suaves y cítricos frescos.',
    from: 61,
    to: 70,
    accent: '#2e8bc0',
    badge: '🌊',
    scene: 'coast',
    sky: ['#e2f4ff', '#fff9e6'],
    ground: '#8fd3f4',
  },
  {
    id: 7,
    name: 'Montaña de hielo & oolong',
    short: 'Montaña helada',
    blurb: 'Cumbres heladas, oolong tostado y dobles capas.',
    from: 71,
    to: 80,
    accent: '#5aa9d6',
    badge: '🏔️',
    scene: 'ice',
    sky: ['#eaf6ff', '#f3faff'],
    ground: '#bfe3f7',
  },
  {
    id: 8,
    name: 'Festival de fuegos de azúcar',
    short: 'Fuegos de azúcar',
    blurb: 'Caramelo en llamas, combos y cielo de chispas.',
    from: 81,
    to: 90,
    accent: '#ff6b35',
    badge: '🎆',
    scene: 'fireworks',
    sky: ['#ffe8d6', '#ffd9e8'],
    ground: '#ff9f6b',
  },
  {
    id: 9,
    name: 'Templo del Boba Legendario',
    short: 'Templo legendario',
    blurb: 'La prueba del Gran Maestro Barista.',
    from: 91,
    to: 100,
    accent: '#c08a1e',
    badge: '🏯',
    scene: 'temple',
    sky: ['#fff4d6', '#ffe9f2'],
    ground: '#e8c777',
  },
  {
    id: 10,
    name: 'Bosque de bambú & jazmín',
    short: 'Bosque bambú',
    blurb: 'Cañas altas, brisa verde y té de jazmín.',
    from: 101,
    to: 110,
    accent: '#3f8f5c',
    badge: '🎋',
    scene: 'bamboo',
    sky: ['#e8f7e4', '#f6fbe8'],
    ground: '#7fbf7a',
  },
  {
    id: 11,
    name: 'Colmena de miel & yuba',
    short: 'Colmena de miel',
    blurb: 'Panales dorados y sirope que gotea.',
    from: 111,
    to: 120,
    accent: '#e0a100',
    badge: '🍯',
    scene: 'honey',
    sky: ['#fff6d9', '#ffeec2'],
    ground: '#f0c04a',
  },
  {
    id: 12,
    name: 'Galaxia de boba estelar',
    short: 'Galaxia boba',
    blurb: 'Perlas que orbitan entre constelaciones.',
    from: 121,
    to: 130,
    accent: '#6a5ae0',
    badge: '🌌',
    scene: 'galaxy',
    sky: ['#e6e2ff', '#f3ecff'],
    ground: '#8b7ae8',
  },
  {
    id: 13,
    name: 'Volcán de caramelo ardiente',
    short: 'Volcán caramelo',
    blurb: 'Lava de azúcar y vapor abrasador.',
    from: 131,
    to: 140,
    accent: '#d9442f',
    badge: '🌋',
    scene: 'volcano',
    sky: ['#ffe0d4', '#ffd0c2'],
    ground: '#e06a46',
  },
  {
    id: 14,
    name: 'Huerto de frutas tropicales',
    short: 'Huerto tropical',
    blurb: 'Mango, lichi y popping boba recién cosechado.',
    from: 141,
    to: 150,
    accent: '#5fae3a',
    badge: '🥭',
    scene: 'orchard',
    sky: ['#f2ffe0', '#fff6dc'],
    ground: '#94cf5c',
  },
  {
    id: 15,
    name: 'Cueva de cristal de azúcar',
    short: 'Cueva cristal',
    blurb: 'Estalactitas dulces y ecos cristalinos.',
    from: 151,
    to: 160,
    accent: '#4a8fd6',
    badge: '💎',
    scene: 'cave',
    sky: ['#e2edff', '#eee6ff'],
    ground: '#7ea8e0',
  },
  {
    id: 16,
    name: 'Islas flotantes de nube',
    short: 'Islas de nube',
    blurb: 'Foam esponjoso suspendido en el cielo.',
    from: 161,
    to: 170,
    accent: '#59a8e8',
    badge: '☁️',
    scene: 'sky',
    sky: ['#e4f3ff', '#fdf3ff'],
    ground: '#b9ddf5',
  },
  {
    id: 17,
    name: 'Carnaval de perlas danzantes',
    short: 'Carnaval boba',
    blurb: 'Confeti, tiovivos y perlas en desfile.',
    from: 171,
    to: 180,
    accent: '#e0417d',
    badge: '🎪',
    scene: 'carnival',
    sky: ['#ffe6f2', '#fff2dc'],
    ground: '#f07aa8',
  },
  {
    id: 18,
    name: 'Aurora de té boreal',
    short: 'Aurora boreal',
    blurb: 'Luces danzantes sobre hielo de oolong.',
    from: 181,
    to: 190,
    accent: '#2fae9e',
    badge: '🌠',
    scene: 'aurora',
    sky: ['#dff6f2', '#e9e4ff'],
    ground: '#63c9bb',
  },
  {
    id: 19,
    name: 'Palacio del Boba Eterno',
    short: 'Palacio eterno',
    blurb: 'El trono dorado de la leyenda del boba.',
    from: 191,
    to: 200,
    accent: '#c99a0e',
    badge: '👑',
    scene: 'royal',
    sky: ['#fff6dd', '#ffe6d9'],
    ground: '#edc85e',
  },
];

export { LEVEL_COUNT };

export function zoneOf(id: number): number {
  const zone = ZONES.find((z) => id >= z.from && id <= z.to);
  return zone?.id ?? ZONES.length - 1;
}

export function zoneInfoOf(id: number): ZoneInfo {
  return ZONES[zoneOf(id)] ?? (ZONES[0] as ZoneInfo);
}

/** Arquetipos de pedido: definen la mecánica principal de cada nivel. */
type Archetype =
  | 'single'
  | 'double'
  | 'triple'
  | 'ice'
  | 'cookie'
  | 'tips'
  | 'combo'
  | 'rush'
  | 'frozenFeast'
  | 'boss';

function archetypeFor(id: number): Archetype {
  if (id <= 4) return 'single';

  const iceOk = id >= 5;
  const tipsOk = id >= 13;
  const cookieOk = id >= 21;
  const comboOk = id >= 27;
  const tripleOk = id >= 36;
  const rushOk = id >= 105;
  const feastOk = id >= 125;
  const slot = ((id - 1) % 10) + 1;
  // A partir de la región 11 la rotación se desplaza para que no se repita el patrón.
  const shifted = id > 100 && (Math.floor((id - 1) / 10) % 2 === 1);

  switch (slot) {
    case 1:
      return 'single';
    case 2:
      return rushOk && shifted ? 'rush' : tipsOk ? 'tips' : 'single';
    case 3:
      return feastOk && shifted ? 'frozenFeast' : iceOk ? 'ice' : 'single';
    case 4:
      return 'double';
    case 5:
      return cookieOk ? 'cookie' : iceOk ? 'ice' : 'single';
    case 6:
      return comboOk ? 'combo' : 'double';
    case 7:
      return feastOk && !shifted ? 'frozenFeast' : iceOk ? 'ice' : 'single';
    case 8:
      return tripleOk ? 'triple' : 'double';
    case 9:
      return rushOk && !shifted ? 'rush' : cookieOk ? 'cookie' : 'single';
    default:
      return 'boss';
  }
}

/**
 * Genera la configuración de un nivel de forma determinista (100 niveles, 10 zonas).
 * La dificultad sube con el id: más sabores, más obstáculos y objetivos combinados.
 */
export function buildLevel(id: number): LevelConfig {
  const zone = zoneOf(id);
  const kindCount = zone === 0 ? 4 : zone <= 2 ? 5 : 6;
  const kinds: Kind[] = ALL_KINDS.slice(0, kindCount);

  const arch = archetypeFor(id);
  const goals: Goal[] = [];
  let moves = Math.max(18, 26 - Math.floor(id / 14));
  let ice: IceSpec | null = null;
  let cookie: CookieSpec | null = null;

  /** Objetivo de recolección escalado por dificultad. */
  const collect = (factor = 1): number =>
    Math.max(8, Math.min(28, Math.round((12 + id * 0.28) * factor)));

  const pick = (offset: number): Kind => kinds[(id + offset) % kinds.length] as Kind;

  switch (arch) {
    case 'single': {
      goals.push({ type: 'collect', kind: pick(0), target: collect() });
      moves += 3;
      break;
    }

    case 'double': {
      goals.push({ type: 'collect', kind: pick(0), target: collect(0.5) });
      goals.push({ type: 'collect', kind: pick(3), target: collect(0.5) });
      moves += 4;
      break;
    }

    case 'triple': {
      goals.push({ type: 'collect', kind: pick(0), target: collect(0.42) });
      goals.push({ type: 'collect', kind: pick(2), target: collect(0.42) });
      goals.push({ type: 'collect', kind: pick(4), target: collect(0.38) });
      moves += 7;
      break;
    }

    case 'ice': {
      const count = Math.min(10, 4 + Math.floor(id / 12));
      const layers: 1 | 2 = id >= 60 ? 2 : 1;
      ice = { count, layers };
      goals.push({ type: 'ice', target: count * layers });
      moves += 6;
      if (id >= 17) goals.push({ type: 'collect', kind: pick(1), target: collect(0.38) });
      break;
    }

    case 'cookie': {
      const count = Math.min(10, 4 + Math.floor((id - 16) / 10));
      const layers: 1 | 2 = id >= 65 ? 2 : 1;
      cookie = { count, layers };
      goals.push({ type: 'cookie', target: count * layers });
      moves += 6;
      if (id >= 34) goals.push({ type: 'collect', kind: pick(2), target: collect(0.38) });
      break;
    }

    case 'tips': {
      goals.push({ type: 'tips', target: 900 + id * 42 });
      moves += 5;
      break;
    }

    case 'combo': {
      goals.push({ type: 'combo', target: 3 });
      goals.push({ type: 'collect', kind: pick(0), target: collect(0.42) });
      moves += 6;
      break;
    }

    case 'rush': {
      // Hora punta: propinas altas y un combo encadenado.
      goals.push({ type: 'tips', target: 1100 + id * 30 });
      goals.push({ type: 'combo', target: 3 });
      moves += 7;
      break;
    }

    case 'frozenFeast': {
      // Banquete helado: hielo y galleta a la vez, sin recolección extra.
      const iceCount = Math.min(9, 4 + Math.floor(id / 40));
      ice = { count: iceCount, layers: 1 };
      goals.push({ type: 'ice', target: iceCount });

      const cookieCount = Math.min(9, 4 + Math.floor(id / 45));
      cookie = { count: cookieCount, layers: 1 };
      goals.push({ type: 'cookie', target: cookieCount });
      moves += 9;
      break;
    }

    case 'boss':
    default: {
      // Jefe de zona: dos obstáculos y una recolección exigente.
      const iceCount = Math.min(8, 3 + Math.floor(id / 20));
      ice = { count: iceCount, layers: id >= 70 ? 2 : 1 };
      goals.push({ type: 'ice', target: iceCount * ice.layers });

      if (id >= 30) {
        const cookieCount = Math.min(8, 3 + Math.floor(id / 24));
        cookie = { count: cookieCount, layers: 1 };
        goals.push({ type: 'cookie', target: cookieCount * cookie.layers });
      }

      goals.push({ type: 'collect', kind: pick(0), target: collect(0.45) });
      moves += 12;
      break;
    }
  }

  if (id >= 25) moves += 2;
  if (id >= 55) moves += 2;
  if (id >= 85) moves += 2;
  if (id >= 120) moves += 2;
  if (id >= 160) moves += 2;

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
    cookie,
    thresholds: { two: 600 + id * 38, three: 1100 + id * 68 },
    seed: id * 9973 + 17,
  };
}

export interface FreeOptions {
  kinds: FreeKindCount;
  ice: boolean;
  cookie?: boolean;
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
    cookie: opts.cookie ? { count: 6, layers: 1 } : null,
    thresholds: { two: 0, three: 0 },
    seed: opts.seed,
    free: true,
  };
}

export function isZoneStart(id: number): boolean {
  return ZONES.some((z) => z.from === id);
}

/** Los jefes de zona cierran cada bloque de 10 pedidos. */
export function isZoneBoss(id: number): boolean {
  return ZONES.some((z) => z.to === id);
}
