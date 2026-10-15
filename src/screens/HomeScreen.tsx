import { useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, Map as MapIcon, Play, Settings, Sparkles, Star, Trophy, Volume2, VolumeX, RotateCcw, X } from 'lucide-react';
import { Mascot } from '../components/Mascot';
import { Pill } from '../components/HUD';
import { LEVEL_COUNT } from '../game/constants';
import type { SaveData } from '../game/storage';
import type { LayoutInfo } from '../hooks/useLayout';

interface HomeScreenProps {
  save: SaveData;
  layout: LayoutInfo;
  continueLevel: number | null;
  onMap: () => void;
  onPlay: (levelId: number) => void;
  onToggleSound: () => void;
  onReset: () => void;
  onFree: () => void;
}

export function HomeScreen({
  save,
  layout,
  continueLevel,
  onMap,
  onPlay,
  onToggleSound,
  onReset,
  onFree,
}: HomeScreenProps) {
  const [settings, setSettings] = useState(false);
  const totalStars = Object.values(save.stars).reduce((sum, s) => sum + s, 0);
  const row = layout.orientation === 'landscape' && layout.height < 620;
  const mascotSize = Math.round(layout.mascotSize * (row ? 1.35 : 1.7));

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-y-auto px-5 py-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] ${
        row ? 'gap-8' : ''
      }`}
    >
      <div className={`mx-auto flex w-full max-w-md flex-col items-center gap-4 text-center ${row ? 'sm:flex-row sm:text-left' : ''}`}>
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="shrink-0"
        >
          <Mascot mood="happy" size={mascotSize} />
        </motion.div>

        <div className="flex min-w-0 flex-col items-center gap-3 sm:items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[#4f8f4a]">Tea Lab · Tienda de perlas</p>
            <h1 className="font-display text-5xl font-black leading-none text-[#5b44a8] drop-shadow-[0_3px_0_#fff] sm:text-6xl">
              Ratón Boba
            </h1>
            <p className="mt-2 text-sm font-semibold text-[#7a6a8a]">
              Combina perlas, té y leche para servir pedidos perfectos.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            <Pill icon={<Coins />} label="Propinas" value={save.totalTips.toLocaleString('es-ES')} tone="mango" />
            <Pill icon={<Star />} label="Estrellas" value={`${totalStars}/${LEVEL_COUNT * 3}`} tone="matcha" />
            <Pill icon={<Trophy />} label="Pedidos" value={`${Object.keys(save.stars).length}/${LEVEL_COUNT}`} tone="sakura" />
          </div>

          <div className="mt-2 grid w-full max-w-xs gap-3">
            <button
              type="button"
              onClick={onMap}
              className="flex h-16 items-center justify-center gap-3 rounded-3xl bg-gradient-to-b from-[#9b84f0] to-[#7d62c9] text-2xl font-black text-white shadow-[0_12px_24px_-8px_rgba(125,98,201,0.8),inset_0_2px_0_rgba(255,255,255,0.35)] transition active:scale-95"
            >
              <MapIcon className="h-7 w-7" /> Tienda
            </button>
            <button
              type="button"
              onClick={onFree}
              className="flex h-14 items-center justify-center gap-2 rounded-3xl border-2 border-white bg-gradient-to-b from-[#c8f0b4] to-[#8fc975] text-xl font-black text-[#2f5f2c] shadow-[0_10px_20px_-8px_rgba(79,143,74,0.7)] transition active:scale-95"
            >
              <Sparkles className="h-6 w-6" /> Modo Libre
            </button>
            {continueLevel !== null && (
              <button
                type="button"
                onClick={() => onPlay(continueLevel)}
                className="flex h-13 items-center justify-center gap-2 rounded-2xl border-2 border-white bg-white/85 py-3 font-extrabold text-[#4f8f4a] shadow-md transition active:scale-95"
              >
                <Play className="h-5 w-5 fill-[#4f8f4a]" /> Seguir con el pedido #{continueLevel}
              </button>
            )}
          </div>

          <div className="mt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleSound}
              aria-label={save.soundOn ? 'Silenciar' : 'Activar sonido'}
              aria-pressed={save.soundOn}
              className="grid h-11 w-11 place-items-center rounded-full border-2 border-white bg-white/80 text-[#5b44a8] shadow active:scale-90 [&>svg]:h-[62%] [&>svg]:w-[62%]"
            >
              {save.soundOn ? <Volume2 /> : <VolumeX />}
            </button>
            <button
              type="button"
              onClick={() => setSettings((v) => !v)}
              aria-label="Ajustes"
              aria-expanded={settings}
              className="grid h-11 w-11 place-items-center rounded-full border-2 border-white bg-white/80 text-[#5b44a8] shadow active:scale-90 [&>svg]:h-[62%] [&>svg]:w-[62%]"
            >
              {settings ? <X /> : <Settings />}
            </button>
          </div>

          {settings && (
            <div className="w-full max-w-xs rounded-2xl border border-white bg-white/85 p-3 text-left shadow-md">
              <p className="text-sm font-bold text-[#4a3a6b]">Tu progreso se guarda en este navegador.</p>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('¿Borrar todo el progreso de la Tienda?')) onReset();
                }}
                className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl border-2 border-[#ffb7c9] bg-[#fff0f4] font-bold text-[#a32a57] active:scale-95"
              >
                <RotateCcw className="h-4 w-4" /> Reiniciar progreso
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
