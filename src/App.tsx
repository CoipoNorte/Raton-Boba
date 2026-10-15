import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Background } from './components/Background';
import { HomeScreen } from './screens/HomeScreen';
import { MapScreen } from './screens/MapScreen';
import { PlayScreen } from './screens/PlayScreen';
import { FreeScreen } from './screens/FreeScreen';
import { useLayout } from './hooks/useLayout';
import { LEVEL_COUNT } from './game/constants';
import { buildFreeLevel, buildLevel } from './game/levels';
import { clearSave, defaultSave, loadSave, saveSave, type FreePrefs, type SaveData } from './game/storage';
import { setSoundEnabled, unlockAudio } from './game/sound';
import type { FreeSummary, LevelConfig, LevelResult } from './game/types';

type Screen = 'home' | 'map' | 'free' | 'play';

/** Un pedido está abierto si es el primero, o si el anterior o él mismo tienen estrellas. */
function isUnlocked(save: SaveData, id: number): boolean {
  if (id === 1) return true;
  return (save.stars[String(id - 1)] ?? 0) > 0 || (save.stars[String(id)] ?? 0) > 0;
}

function currentLevel(save: SaveData): number {
  let current = 1;
  for (let id = 1; id <= LEVEL_COUNT; id++) {
    if (isUnlocked(save, id)) current = id;
  }
  return current;
}

/** Semilla nueva para cada sesión libre (se llama sólo desde manejadores de eventos). */
const randomSeed = (): number => Math.floor(Math.random() * 1_000_000_000) + 1;

export default function App() {
  const [save, setSave] = useState<SaveData>(() => loadSave());
  const [screen, setScreen] = useState<Screen>('home');
  const [playCfg, setPlayCfg] = useState<LevelConfig>(() => buildLevel(1));
  const [attempt, setAttempt] = useState(0);
  const layout = useLayout();

  useEffect(() => {
    saveSave(save);
  }, [save]);

  useEffect(() => {
    setSoundEnabled(save.soundOn);
  }, [save.soundOn]);

  // El audio sólo se activa tras un gesto real del usuario.
  useEffect(() => {
    const unlock = (): void => unlockAudio();
    window.addEventListener('pointerdown', unlock, { capture: true });
    window.addEventListener('keydown', unlock, { capture: true });
    return () => {
      window.removeEventListener('pointerdown', unlock, { capture: true });
      window.removeEventListener('keydown', unlock, { capture: true });
    };
  }, []);

  const toggleSound = useCallback((): void => {
    setSave((prev) => ({ ...prev, soundOn: !prev.soundOn }));
  }, []);

  const handleFinish = useCallback((result: LevelResult): void => {
    setSave((prev) => {
      const key = String(result.levelId);
      const prevStars = prev.stars[key] ?? 0;
      const prevBest = prev.bestTips[key] ?? 0;
      return {
        ...prev,
        stars: { ...prev.stars, [key]: Math.max(prevStars, result.stars) },
        bestTips: { ...prev.bestTips, [key]: Math.max(prevBest, result.tips) },
        totalTips: prev.totalTips + result.tips,
      };
    });
  }, []);

  /** Al terminar una sesión libre se suman sus propinas y se actualizan los récords. */
  const handleFreeEnd = useCallback((summary: FreeSummary): void => {
    setSave((prev) => ({
      ...prev,
      totalTips: prev.totalTips + summary.tips,
      freeBest: Math.max(prev.freeBest, summary.tips),
      freeBestCombo: Math.max(prev.freeBestCombo, summary.bestCombo),
      freeSessions: prev.freeSessions + 1,
    }));
  }, []);

  const playLevel = useCallback((id: number): void => {
    setPlayCfg(buildLevel(id));
    setAttempt((a) => a + 1);
    setScreen('play');
  }, []);

  const startFree = useCallback((prefs: FreePrefs): void => {
    setSave((prev) => ({ ...prev, freePrefs: prefs }));
    setPlayCfg(buildFreeLevel({ kinds: prefs.kinds, ice: prefs.ice, seed: randomSeed() }));
    setAttempt((a) => a + 1);
    setScreen('play');
  }, []);

  const newFreeSession = useCallback((): void => {
    startFree(save.freePrefs);
  }, [save.freePrefs, startFree]);

  const reset = useCallback((): void => {
    clearSave();
    setSave(defaultSave());
  }, []);

  const hasNext =
    !playCfg.free && playCfg.id < LEVEL_COUNT && isUnlocked(save, playCfg.id + 1);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden text-[#3b2a24]">
      <Background />

      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          className="relative z-0 h-full w-full"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
        >
          {screen === 'home' && (
            <HomeScreen
              save={save}
              layout={layout}
              continueLevel={currentLevel(save)}
              onMap={() => setScreen('map')}
              onPlay={playLevel}
              onToggleSound={toggleSound}
              onReset={reset}
              onFree={() => setScreen('free')}
            />
          )}

          {screen === 'map' && (
            <MapScreen save={save} onBack={() => setScreen('home')} onPlay={playLevel} onToggleSound={toggleSound} />
          )}

          {screen === 'free' && (
            <FreeScreen save={save} layout={layout} onBack={() => setScreen('home')} onStart={startFree} />
          )}

          {screen === 'play' && (
            <PlayScreen
              key={`${playCfg.id}-${playCfg.free ? 'free' : 'level'}-${attempt}`}
              cfg={playCfg}
              soundOn={save.soundOn}
              hasNext={hasNext}
              freeBest={save.freeBest}
              onToggleSound={toggleSound}
              onExit={() => setScreen(playCfg.free ? 'home' : 'map')}
              onNext={() => playLevel(playCfg.id + 1)}
              onRetry={() => setAttempt((a) => a + 1)}
              onFinish={handleFinish}
              onFreeEnd={handleFreeEnd}
              onNewFree={newFreeSession}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
