import { useState } from 'react';
import Scoreboard from './Scoreboard';
import { playStart, unlockAudio } from '../lib/sounds';

interface StartScreenProps {
  onStart: (playerName: string) => void;
}

export default function StartScreen({ onStart }: StartScreenProps) {
  const [name, setName] = useState('Dad');

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6 text-center sm:gap-8">
      <div className="space-y-2">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">
          Happy Father's Day
        </p>
        <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
          Blitz <span className="text-gold">Fathersday</span>
        </h1>
        <p className="text-sm text-paper/70 sm:text-base">
          Five minutes on the clock. Nothing but mate-in-1s. How many can you find
          before time runs out?
        </p>
      </div>

      <div className="w-full space-y-3 rounded-2xl border border-gold/20 bg-ink-light p-6">
        <label htmlFor="player-name" className="block text-left text-sm font-medium text-paper/80">
          Who's playing?
        </label>
        <input
          id="player-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={24}
          className="w-full rounded-lg border border-gold/30 bg-ink px-4 py-2 text-paper outline-none focus:border-gold focus:ring-2 focus:ring-gold/40"
          placeholder="Enter a name"
        />
        <button
          onClick={() => {
            unlockAudio();
            playStart();
            onStart(name.trim() || 'Dad');
          }}
          className="w-full rounded-lg bg-gold px-4 py-3 font-display text-lg font-semibold text-ink transition hover:bg-gold/90 active:scale-[0.99]"
        >
          Start the Clock
        </button>
        <p className="text-xs text-paper/50">
          Each puzzle is a fresh mate-in-1 from Lichess. Tap or drag the piece that
          delivers checkmate.
        </p>
      </div>

      <Scoreboard />
    </div>
  );
}