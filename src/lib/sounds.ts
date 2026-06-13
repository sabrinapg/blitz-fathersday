let audioCtx: AudioContext | null = null;

/**
 * Lazily creates (or resumes) a shared AudioContext. Must be called from a
 * user gesture handler the first time, per browser autoplay rules.
 */
function getContext(): AudioContext {
  if (!audioCtx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new Ctor();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/** Call once from a click handler to unlock audio on iOS/Safari. */
export function unlockAudio() {
  getContext();
}

interface ToneOptions {
  frequency: number;
  duration: number;
  type?: OscillatorType;
  startOffset?: number;
  gain?: number;
}

function tone({ frequency, duration, type = 'sine', startOffset = 0, gain = 0.15 }: ToneOptions) {
  try {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.value = frequency;

    const startTime = ctx.currentTime + startOffset;
    gainNode.gain.setValueAtTime(gain, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  } catch {
    // Audio isn't critical to gameplay — fail silently if unsupported.
  }
}

/** Soft click for any accepted chess move. */
export function playMove() {
  tone({ frequency: 520, duration: 0.07, type: 'square', gain: 0.05 });
}

/** Bright ascending arpeggio for a correct mate-in-1. */
export function playCorrect() {
  [523.25, 659.25, 783.99, 1046.5].forEach((frequency, i) =>
    tone({ frequency, duration: 0.18, type: 'triangle', startOffset: i * 0.07, gain: 0.1 })
  );
}

/** Low buzz for an incorrect move. */
export function playWrong() {
  tone({ frequency: 180, duration: 0.22, type: 'sawtooth', gain: 0.08 });
  tone({ frequency: 130, duration: 0.28, type: 'sawtooth', startOffset: 0.05, gain: 0.06 });
}

/** Subtle tick for the final countdown seconds. */
export function playTick() {
  tone({ frequency: 880, duration: 0.04, type: 'square', gain: 0.03 });
}

/** Cheerful rising chime when the game starts. */
export function playStart() {
  [262, 392, 523.25].forEach((frequency, i) =>
    tone({ frequency, duration: 0.15, type: 'triangle', startOffset: i * 0.07, gain: 0.08 })
  );
}

/** Descending chime when time runs out. */
export function playGameOver() {
  [392, 329.63, 261.63].forEach((frequency, i) =>
    tone({ frequency, duration: 0.35, type: 'triangle', startOffset: i * 0.15, gain: 0.1 })
  );
}