/**
 * Sonido sintetizado con WebAudio (sin archivos). El AudioContext se crea y
 * reanuda únicamente tras un gesto real del usuario.
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;
let enabled = true;

const MASTER_VOLUME = 0.55;

export function setSoundEnabled(on: boolean): void {
  enabled = on;
  if (master && ctx) {
    master.gain.setTargetAtTime(on ? MASTER_VOLUME : 0, ctx.currentTime, 0.02);
  }
}

export function unlockAudio(): void {
  if (typeof window === 'undefined') return;
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    try {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = enabled ? MASTER_VOLUME : 0;
      master.connect(ctx.destination);
    } catch {
      ctx = null;
      return;
    }
  }
  if (ctx.state === 'suspended') void ctx.resume();
}

function readyCtx(): AudioContext | null {
  if (!ctx || !master || !enabled) return null;
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

interface ToneOpts {
  freq: number;
  dur: number;
  type?: OscillatorType;
  vol?: number;
  delay?: number;
  slideTo?: number;
}

function tone({ freq, dur, type = 'sine', vol = 0.18, delay = 0, slideTo }: ToneOpts): void {
  const c = readyCtx();
  if (!c || !master) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

interface NoiseOpts {
  dur: number;
  vol?: number;
  delay?: number;
  freq?: number;
  q?: number;
  type?: BiquadFilterType;
  sweepTo?: number;
}

function getNoise(c: AudioContext): AudioBuffer {
  if (!noiseBuffer || noiseBuffer.sampleRate !== c.sampleRate) {
    const len = Math.floor(c.sampleRate * 1.2);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    noiseBuffer = buf;
  }
  return noiseBuffer;
}

function noise({ dur, vol = 0.12, delay = 0, freq = 1800, q = 0.8, type = 'bandpass', sweepTo }: NoiseOpts): void {
  const c = readyCtx();
  if (!c || !master) return;
  const t0 = c.currentTime + delay;
  const src = c.createBufferSource();
  src.buffer = getNoise(c);
  const filter = c.createBiquadFilter();
  filter.type = type;
  filter.frequency.setValueAtTime(freq, t0);
  if (sweepTo) filter.frequency.exponentialRampToValueAtTime(sweepTo, t0 + dur);
  filter.Q.value = q;
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + Math.min(0.02, dur * 0.3));
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter).connect(gain).connect(master);
  src.start(t0, Math.random() * 0.5, dur + 0.05);
}

const PENTA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];

export const sfx = {
  /** Clic suave al tocar una ficha. */
  select(): void {
    tone({ freq: 660, dur: 0.07, vol: 0.09, type: 'triangle', slideTo: 880 });
  },
  /** Ficha deslizándose: un "fshh" corto. */
  swap(): void {
    noise({ dur: 0.12, vol: 0.07, freq: 900, sweepTo: 2600, q: 1.2 });
  },
  /** Combinación normal, con tono más alto según la cascada. */
  pop(level = 0): void {
    const base = 520 + Math.min(level, 6) * 70;
    tone({ freq: base, dur: 0.13, vol: 0.16, type: 'sine', slideTo: base * 1.8 });
    noise({ dur: 0.06, vol: 0.06, freq: 3200, type: 'highpass' });
  },
  /** Perlas cayendo: una cascada de clics pequeños. */
  pearls(count = 5): void {
    for (let i = 0; i < count; i++) {
      noise({
        dur: 0.05,
        vol: 0.05,
        delay: i * 0.045 + Math.random() * 0.02,
        freq: 2400 + Math.random() * 1600,
        q: 4,
      });
    }
  },
  /** Líquido llenando el vaso. */
  liquid(): void {
    noise({ dur: 0.5, vol: 0.09, freq: 300, sweepTo: 1100, q: 0.9 });
  },
  /** Power-up creado o activado: arpegio brillante. */
  special(): void {
    [0, 1, 2, 3].forEach((i) => {
      tone({ freq: PENTA[i + 1] ?? 880, dur: 0.16, vol: 0.12, type: 'triangle', delay: i * 0.05 });
    });
  },
  /** Pedido inválido: suave y sin castigo. */
  invalid(): void {
    tone({ freq: 220, dur: 0.18, vol: 0.06, type: 'sine', slideTo: 160 });
  },
  /** Victoria: arpegio de éxito. */
  win(): void {
    const seq = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    seq.forEach((f, i) => tone({ freq: f, dur: 0.32, vol: 0.14, type: 'triangle', delay: i * 0.1 }));
    noise({ dur: 0.4, vol: 0.05, delay: 0.5, freq: 5000, type: 'highpass' });
  },
  /** Estrella ganada en el resultado. */
  star(index: number): void {
    tone({ freq: PENTA[index + 2] ?? 880, dur: 0.22, vol: 0.14, type: 'triangle' });
  },
  /** Final sin movimientos: descenso amable. */
  lose(): void {
    [392, 329.63, 261.63].forEach((f, i) =>
      tone({ freq: f, dur: 0.28, vol: 0.09, type: 'sine', delay: i * 0.16 }),
    );
  },
  /** Sellado del pedido: "shhh-pop". */
  seal(): void {
    noise({ dur: 0.42, vol: 0.09, freq: 4500, type: 'highpass', sweepTo: 9000 });
    tone({ freq: 640, dur: 0.12, vol: 0.14, delay: 0.38, slideTo: 1200 });
  },
  /** Tictac suave para los últimos segundos (reservado). */
  tick(): void {
    noise({ dur: 0.03, vol: 0.05, freq: 3000, q: 6 });
  },
  /** Botón de interfaz. */
  click(): void {
    tone({ freq: 740, dur: 0.05, vol: 0.07, type: 'sine' });
  },
};
