import { useEffect, useState } from 'react';
import { getTopScores } from '../lib/scores';
import type { ScoreEntry } from '../types';

interface ScoreboardProps {
  /** highlight the most recent entry from this run, if it made the list */
  highlightId?: string;
  refreshKey?: number;
}

export default function Scoreboard({ highlightId, refreshKey }: ScoreboardProps) {
  const [scores, setScores] = useState<ScoreEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getTopScores()
      .then((data) => {
        if (!cancelled) setScores(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <div className="w-full max-w-md rounded-2xl bg-paper text-ink shadow-xl">
      <div className="border-b border-ink/10 px-5 py-3">
        <h2 className="font-display text-lg font-semibold tracking-tight">Mate-in-1 Leaderboard</h2>
      </div>

      {error && (
        <p className="px-5 py-4 text-sm text-ember">
          Couldn't load the leaderboard: {error}
        </p>
      )}

      {!error && scores === null && (
        <p className="px-5 py-4 text-sm text-ink/60">Loading scores…</p>
      )}

      {!error && scores !== null && scores.length === 0 && (
        <p className="px-5 py-4 text-sm text-ink/60">
          No scores yet — be the first on the board.
        </p>
      )}

      {!error && scores !== null && scores.length > 0 && (
        <ol className="divide-y divide-ink/10">
          {scores.map((entry, i) => (
            <li
              key={entry.id}
              className={`flex items-center gap-4 px-5 py-2.5 text-sm ${
                entry.id === highlightId ? 'bg-gold/20' : ''
              }`}
            >
              <span className="font-mono text-ink/50 w-6 text-right">{i + 1}</span>
              <span className="flex-1 font-medium truncate">{entry.player_name}</span>
              <span className="font-mono text-lg font-bold">{entry.score}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
