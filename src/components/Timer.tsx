interface TimerProps {
  secondsLeft: number;
}

export default function Timer({ secondsLeft }: TimerProps) {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const isLow = secondsLeft <= 30 && secondsLeft > 0;
  const isOut = secondsLeft <= 0;

  return (
    <div
      className={`inline-flex items-baseline gap-2 rounded-xl border px-4 py-2 font-mono text-3xl tabular-nums tracking-widest transition-colors duration-300 sm:px-6 sm:py-3 sm:text-5xl ${
        isOut
          ? 'border-ember bg-ember/10 text-ember'
          : isLow
          ? 'border-ember/60 bg-ember/5 text-ember animate-pulse'
          : 'border-gold/40 bg-ink-light text-paper'
      }`}
      role="timer"
      aria-live="polite"
    >
      {display}
    </div>
  );
}