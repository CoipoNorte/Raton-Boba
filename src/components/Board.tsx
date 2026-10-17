import { memo, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { motion } from 'framer-motion';
import { CandyIcon } from './CandyIcon';
import { FALL_MS, POP_MS } from '../game/constants';
import { colsOf, rowsOf, samePos } from '../game/logic';
import type { Board as BoardData, Pos, Tile } from '../game/types';

interface BoardProps {
  board: BoardData;
  cell: number;
  popping: readonly number[];
  selected: Pos | null;
  hint: [Pos, Pos] | null;
  onTap: (p: Pos) => void;
  onSwap: (a: Pos, b: Pos) => void;
  label: string;
  shake?: boolean;
  /** Nivel de cascada actual: intensifica partículas, brillo y temblor. */
  fever?: number;
}

const SPRING = { type: 'spring' as const, stiffness: 420, damping: 34, mass: 0.9 };

interface TileViewProps {
  tile: Tile;
  r: number;
  c: number;
  cell: number;
  isPopping: boolean;
  isSelected: boolean;
  isHinted: boolean;
  intensity: number;
}

const SPARKLE_COLORS = ['#ffd166', '#ff8fb1', '#b9a4f0', '#8fbf6a', '#ffffff', '#ffb36b', '#6aa8ff'];

/** Partículas procedimentales que saltan cuando una ficha explota */
function PopSparkles({ cell, intensity }: { cell: number; intensity: number }) {
  const count = Math.min(10, 5 + intensity * 2);
  const particles = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + i * 0.3;
    const reach = cell * (0.42 + (i % 3) * 0.12);
    return {
      x: Math.cos(angle) * reach,
      y: Math.sin(angle) * reach,
      size: 5 + ((i * 3) % 5),
      color: SPARKLE_COLORS[i % SPARKLE_COLORS.length] as string,
    };
  });

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full shadow-sm"
          style={{ width: p.size, height: p.size, backgroundColor: p.color }}
          initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
          animate={{ x: p.x, y: p.y, scale: 0, opacity: 0 }}
          transition={{ duration: POP_MS / 1000, ease: 'easeOut' }}
        />
      ))}
      <motion.span
        className="absolute rounded-full border-2 border-white"
        style={{ width: cell * 0.5, height: cell * 0.5 }}
        initial={{ scale: 0.3, opacity: 0.9 }}
        animate={{ scale: 1.9, opacity: 0 }}
        transition={{ duration: POP_MS / 1000, ease: 'easeOut' }}
      />
    </div>
  );
}

/** Ficha animada: se identifica por id, así cae, se desliza o explota sin saltos. */
const TileView = memo(function TileView({
  tile,
  r,
  c,
  cell,
  isPopping,
  isSelected,
  isHinted,
  intensity,
}: TileViewProps) {
  const x = c * cell;
  const y = r * cell;

  return (
    <motion.div
      className="absolute left-0 top-0"
      style={{ width: cell, height: cell }}
      initial={{ x, y: y - cell * 1.6, opacity: 0 }}
      animate={{
        x,
        y,
        opacity: isPopping ? 0 : 1,
        scale: isPopping ? 0.15 : isSelected ? 1.1 : 1,
      }}
      transition={
        isPopping
          ? { duration: POP_MS / 1000, ease: 'easeIn' }
          : {
              x: SPRING,
              y: { ...SPRING, delay: Math.min(r * 0.012, 0.1) },
              opacity: { duration: 0.2 },
              scale: { type: 'spring', stiffness: 500, damping: 22 },
              default: { duration: FALL_MS / 1000 },
            }
      }
    >
      <div className={`relative h-full w-full p-[9%] ${isHinted ? 'hint-pulse' : ''}`}>
        {isSelected && (
          <span className="pointer-events-none absolute inset-[2%] rounded-full ring-4 ring-white/90 shadow-[0_0_18px_rgba(255,255,255,0.9)]" />
        )}
        <motion.div
          key={tile.special}
          className="h-full w-full drop-shadow-[0_3px_3px_rgba(59,42,36,0.25)]"
          initial={tile.special === 'none' ? false : { scale: 0.2, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 16 }}
        >
          <CandyIcon
            kind={tile.kind}
            special={tile.special}
            ice={tile.ice}
            cookie={tile.cookie ?? 0}
            className="h-full w-full"
          />
        </motion.div>
        {isPopping && <PopSparkles cell={cell} intensity={intensity} />}
      </div>
    </motion.div>
  );
});

export function Board({
  board,
  cell,
  popping,
  selected,
  hint,
  onTap,
  onSwap,
  label,
  shake = false,
  fever = 0,
}: BoardProps) {
  const rows = rowsOf(board);
  const cols = colsOf(board);
  const pad = Math.max(6, Math.round(cell * 0.14));
  const innerRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef<{ start: Pos; x: number; y: number; consumed: boolean } | null>(null);
  const popSet = new Set(popping);
  const hintKeys = new Set(hint ? hint.map((p) => `${p.r},${p.c}`) : []);

  const cellAt = (clientX: number, clientY: number): Pos | null => {
    const el = innerRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const c = Math.floor((clientX - rect.left) / cell);
    const r = Math.floor((clientY - rect.top) / cell);
    if (r < 0 || c < 0 || r >= rows || c >= cols) return null;
    return { r, c };
  };

  const onDown = (e: ReactPointerEvent<HTMLDivElement>): void => {
    const p = cellAt(e.clientX, e.clientY);
    if (!p) return;
    drag.current = { start: p, x: e.clientX, y: e.clientY, consumed: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onMove = (e: ReactPointerEvent<HTMLDivElement>): void => {
    const d = drag.current;
    if (!d || d.consumed) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    const threshold = cell * 0.28;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < threshold) return;
    let target: Pos;
    if (Math.abs(dx) > Math.abs(dy)) {
      target = { r: d.start.r, c: d.start.c + (dx > 0 ? 1 : -1) };
    } else {
      target = { r: d.start.r + (dy > 0 ? 1 : -1), c: d.start.c };
    }
    d.consumed = true;
    if (target.r >= 0 && target.c >= 0 && target.r < rows && target.c < cols) {
      onSwap(d.start, target);
    }
  };

  const onUp = (): void => {
    const d = drag.current;
    drag.current = null;
    if (d && !d.consumed) onTap(d.start);
  };

  return (
    <motion.div
      className="relative shrink-0 rounded-[2rem] border-2 border-white/80 bg-gradient-to-b from-white/75 via-[#fbf7ff]/75 to-[#f3e8ff]/80 shadow-[0_18px_40px_-12px_rgba(125,98,201,0.45),inset_0_2px_0_rgba(255,255,255,0.85)] backdrop-blur-sm"
      style={{ width: cell * cols + pad * 2, height: cell * rows + pad * 2 }}
      animate={
        shake
          ? {
              x: [0, -4 - fever, 4 + fever, -3, 3, 0],
              y: [0, 3 + fever, -3 - fever, 2, -2, 0],
            }
          : { x: 0, y: 0 }
      }
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      role="grid"
      aria-label={label}
    >
      {/* Aro incandescente cuando hay fiebre de combos */}
      {fever >= 3 && (
        <span
          className="fever-glow pointer-events-none absolute -inset-1 rounded-[2.2rem]"
          style={{
            background:
              'conic-gradient(from 0deg, #ffd16655, #ff6b3555, #e0517d55, #7d62c955, #ffd16655)',
            filter: 'blur(10px)',
          }}
          aria-hidden="true"
        />
      )}
      {/* Ranuras suaves de la bandeja: dan profundidad sin competir con las fichas. */}
      {Array.from({ length: rows * cols }, (_, i) => {
        const r = Math.floor(i / cols);
        const c = i % cols;
        return (
          <span
            key={i}
            className="pointer-events-none absolute rounded-full bg-[#7d62c9]/10"
            style={{
              left: pad + c * cell + cell * 0.36,
              top: pad + r * cell + cell * 0.36,
              width: cell * 0.28,
              height: cell * 0.28,
            }}
          />
        );
      })}

      <div
        ref={innerRef}
        className="absolute touch-none select-none"
        style={{ left: pad, top: pad, width: cell * cols, height: cell * rows }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => {
          drag.current = null;
        }}
      >
        {board.map((row, r) =>
          row.map((tile, c) => {
            const here = { r, c };
            return (
              <TileView
                key={tile.id}
                tile={tile}
                r={r}
                c={c}
                cell={cell}
                isPopping={popSet.has(tile.id)}
                isSelected={!!selected && samePos(selected, here)}
                isHinted={hintKeys.has(`${r},${c}`)}
                intensity={fever}
              />
            );
          }),
        )}
      </div>
    </motion.div>
  );
}
