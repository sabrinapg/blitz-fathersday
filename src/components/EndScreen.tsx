import { useEffect, useRef, useState } from 'react';
import Scoreboard from './Scoreboard';
import { submitScore } from '../lib/scores';

interface EndScreenProps {
  playerName: string;
  score: number;
  onPlayAgain: () => void;
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
    <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
      <div className="space-y-2">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">Time's up</p>
        <h1 className="font-display text-3xl font-semibold">
          {playerName} found
        </h1>
        <p className="font-display text-7xl font-bold text-gold">{score}</p>
        <p className="font-display text-3xl font-semibold">
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
