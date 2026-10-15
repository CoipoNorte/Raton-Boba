import type { Kind } from './types';

export interface IngredientInfo {
  kind: Kind;
  label: string;
  short: string;
  description: string;
  /** Color de acento usado en UI (no es el único indicador). */
  accent: string;
}

export const INGREDIENTS: Record<Kind, IngredientInfo> = {
  perla: {
    kind: 'perla',
    label: 'Perla de tapioca',
    short: 'Tapioca',
    description: 'Oscura y opaca, clásica del boba.',
    accent: '#4a2c1d',
  },
  mango: {
    kind: 'mango',
    label: 'Popping de mango',
    short: 'Mango',
    description: 'Translúcida, explota con jugo dulce.',
    accent: '#e0a100',
  },
  fresa: {
    kind: 'fresa',
    label: 'Perla de fresa',
    short: 'Fresa',
    description: 'Rosada y frutal, con semillitas.',
    accent: '#e0517d',
  },
  matcha: {
    kind: 'matcha',
    label: 'Té matcha',
    short: 'Matcha',
    description: 'Verde intenso, de la montaña.',
    accent: '#4f8f4a',
  },
  taro: {
    kind: 'taro',
    label: 'Taro morado',
    short: 'Taro',
    description: 'Lavanda cremosa, dulce y suave.',
    accent: '#7d62c9',
  },
  leche: {
    kind: 'leche',
    label: 'Leche entera',
    short: 'Leche',
    description: 'Blanca y cremosa para el final.',
    accent: '#6a7d96',
  },
};

export const ALL_KINDS: Kind[] = ['perla', 'mango', 'fresa', 'matcha', 'taro', 'leche'];
