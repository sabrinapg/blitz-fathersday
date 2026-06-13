import { useEffect, useMemo, useRef, useState } from 'react';
import Scoreboard from './Scoreboard';
import { submitScore } from '../lib/scores';

interface EndScreenProps {
  playerName: string;
  score: number;
  onPlayAgain: () => void;
}

const CONFETTI_COLORS = ['#C9A24B', '#6B8F4E', '#EBECD0', '#C1502E', '#F5F1E6'];

function Confetti({ count = 28 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 2.5 + Math.random() * 1.5,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        rotate: Math.random() * 360,
      })),
    [count]
  );

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}

export default function EndScreen({ playerName, score, onPlayAgain }: EndScreenProps) {
  const [status, setStatus] = useState<'saving' | 'saved' | 'error'>('saving');
  const submitted = useRef(false);

  useEffect(() => {
    if (submitted.current) return;
    submitted.current = true;
    submitScore(playerName, score)
      .then(() => setStatus('saved'))
      .catch(() => setStatus('error'));
  }, [playerName, score]);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-5 text-center sm:gap-6">
      {score > 0 && <Confetti />}
      <div className="space-y-1.5 sm:space-y-2">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">Time's up</p>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">
          {playerName} found
        </h1>
        <p className="font-display text-6xl font-bold text-gold sm:text-7xl">{score}</p>
        <p className="font-display text-2xl font-semibold sm:text-3xl">
          checkmate{score === 1 ? '' : 's'} in 5 minutes
        </p>
      </div>

      {status === 'error' && (
        <p className="text-sm text-ember">
          Couldn't save that score to the leaderboard, but it still counts at home.
        </p>
      )}

      <Scoreboard refreshKey={status === 'saved' ? 1 : 0} />

      <button
        onClick={onPlayAgain}
        className="rounded-lg bg-gold px-6 py-3 font-display text-lg font-semibold text-ink transition hover:bg-gold/90 active:scale-[0.99]"
      >
        Play Again
      </button>
    </div>
  );
}
