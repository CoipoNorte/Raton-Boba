import { motion } from 'framer-motion';

export type MascotMood = 'idle' | 'happy' | 'worried' | 'zen';

interface MascotProps {
  mood?: MascotMood;
  size?: number;
  className?: string;
}

/** Ratoncito boba-barista: visera kawaii, delantal y vaso de boba. Todo en SVG. */
export function Mascot({ mood = 'idle', size = 96, className }: MascotProps) {
  const bounce =
    mood === 'happy'
      ? { y: [0, -14, 0, -8, 0], rotate: [0, -4, 0, 4, 0] }
      : mood === 'worried'
        ? { rotate: [0, -3, 3, -3, 0] }
        : { y: [0, -3, 0] };

  const duration = mood === 'happy' ? 1.2 : mood === 'worried' ? 1.6 : 3.2;

  return (
    <motion.div
      className={`pointer-events-none select-none ${className ?? ''}`}
      style={{ width: size, height: size }}
      animate={bounce}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 120 120" width="100%" height="100%" className="overflow-visible">
        {/* Orejas */}
        <g transform={mood === 'worried' ? 'rotate(-14 36 36) rotate(14 84 36)' : undefined}>
          <circle cx="36" cy="36" r="16" fill="#f4c6d4" stroke="#d8a7b8" strokeWidth="1.5" />
          <circle cx="36" cy="36" r="9" fill="#ffb3c7" />
          <circle cx="84" cy="36" r="16" fill="#f4c6d4" stroke="#d8a7b8" strokeWidth="1.5" />
          <circle cx="84" cy="36" r="9" fill="#ffb3c7" />
        </g>

        {/* Cabeza */}
        <ellipse cx="60" cy="64" rx="36" ry="32" fill="#f6efe6" stroke="#d8c6b5" strokeWidth="2" />

        {/* Visera kawaii */}
        <path d="M26 46 Q60 30 94 46 L94 52 Q60 42 26 52 Z" fill="#8fbf6a" stroke="#4f8f4a" strokeWidth="1.2" />
        <path d="M34 47 Q60 38 86 47" stroke="#eaffd6" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
        <path d="M80 47 Q98 45 104 54 Q92 54 80 52 Z" fill="#6f9f4f" />

        {/* Ojos */}
        {mood === 'happy' ? (
          <g stroke="#2b1d16" strokeWidth="3.6" fill="none" strokeLinecap="round">
            <path d="M41 70 Q47 61 53 70" />
            <path d="M67 70 Q73 61 79 70" />
          </g>
        ) : mood === 'zen' ? (
          <g stroke="#2b1d16" strokeWidth="3" fill="none" strokeLinecap="round">
            <path d="M42 70 Q48 74 54 70" />
            <path d="M66 70 Q72 74 78 70" />
          </g>
        ) : (
          <g className="mascot-eyes">
            <circle cx="48" cy="70" r="5.2" fill="#2b1d16" />
            <circle cx="72" cy="70" r="5.2" fill="#2b1d16" />
            <circle cx="46.5" cy="68.5" r="1.7" fill="#fff" />
            <circle cx="70.5" cy="68.5" r="1.7" fill="#fff" />
          </g>
        )}

        {mood === 'worried' && (
          <g stroke="#7a5440" strokeWidth="2.2" strokeLinecap="round">
            <path d="M42 61 L53 64" />
            <path d="M78 61 L67 64" />
          </g>
        )}

        {/* Mejillas, nariz y boca */}
        <ellipse cx="38" cy="81" rx="6" ry="3.6" fill="#ffb3c7" opacity="0.75" />
        <ellipse cx="82" cy="81" rx="6" ry="3.6" fill="#ffb3c7" opacity="0.75" />
        <ellipse cx="60" cy="78" rx="3.4" ry="2.4" fill="#ff8fa3" />
        {mood === 'happy' ? (
          <path d="M52 84 Q60 98 68 84 Z" fill="#b8325c" stroke="#7a1f3c" strokeWidth="1.2" />
        ) : mood === 'worried' ? (
          <path d="M53 88 Q57 84 60 88 Q63 92 67 88" stroke="#7a5440" strokeWidth="2" fill="none" strokeLinecap="round" />
        ) : mood === 'zen' ? (
          <path d="M56 87 Q60 89 64 87" stroke="#7a5440" strokeWidth="2" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M54 85 Q60 90 66 85" stroke="#7a5440" strokeWidth="2" fill="none" strokeLinecap="round" />
        )}

        {/* Bigotes */}
        <g stroke="#c9b8a6" strokeWidth="1.4" strokeLinecap="round">
          <path d="M26 76 L12 72" />
          <path d="M26 82 L12 84" />
          <path d="M94 76 L108 72" />
          <path d="M94 82 L108 84" />
        </g>

        {/* Delantal */}
        <path d="M40 92 Q60 98 80 92 L84 114 Q60 120 36 114 Z" fill="#ffffff" stroke="#e5d6c6" strokeWidth="1.5" />
        <rect x="50" y="96" width="20" height="12" rx="4" fill="#ffb7c9" opacity="0.85" />
        <path d="M44 92 Q52 84 60 92" stroke="#e5d6c6" strokeWidth="1.5" fill="none" />
        <path d="M76 92 Q68 84 60 92" stroke="#e5d6c6" strokeWidth="1.5" fill="none" />

        {/* Patita con vaso de boba */}
        <circle cx="38" cy="104" r="6" fill="#f6efe6" stroke="#d8c6b5" strokeWidth="1.5" />
        <path d="M82 80 L102 80 L99 110 Q98 116 92 116 L92 116 Q86 116 85 110 Z" fill="#d7a878" stroke="#a9744a" strokeWidth="1.5" />
        <rect x="80" y="76" width="24" height="7" rx="3" fill="#ffb7c9" stroke="#e0889f" strokeWidth="1" />
        <path d="M96 76 L101 56" stroke="#ff8fb1" strokeWidth="3.2" strokeLinecap="round" />
        <circle cx="86" cy="110" r="3" fill="#2b1d16" />
        <circle cx="93" cy="112" r="3" fill="#2b1d16" />
        <circle cx="98" cy="107" r="3" fill="#2b1d16" />
        <circle cx="90" cy="106" r="2.5" fill="#2b1d16" opacity="0.85" />

        {mood === 'worried' && (
          <path d="M104 40 Q110 50 104 56 Q98 50 104 40 Z" fill="#8ed3ff" stroke="#4aa3d9" strokeWidth="1" />
        )}
        {mood === 'happy' && (
          <g fill="#ffd166">
            <path d="M14 36 l3 -7 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 z" opacity="0.9" />
            <path d="M104 22 l2 -5 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 z" opacity="0.9" />
          </g>
        )}
      </svg>
    </motion.div>
  );
}
