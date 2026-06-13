import { useCallback, useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import Board from './Board';
import Timer from './Timer';
import { fetchMateInOnePuzzle } from '../lib/puzzles';
import type { Puzzle } from '../types';

const GAME_LENGTH_SECONDS = 5 * 60;

interface GameScreenProps {
  onGameOver: (score: number) => void;
}

type Feedback = 'idle' | 'correct' | 'wrong';

export default function GameScreen({ onGameOver }: GameScreenProps) {
  const [secondsLeft, setSecondsLeft] = useState(GAME_LENGTH_SECONDS);
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>('idle');
  const [loadingPuzzle, setLoadingPuzzle] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scoreRef = useRef(score);
  scoreRef.current = score;
  const gameOverRef = useRef(onGameOver);
  gameOverRef.current = onGameOver;

  const loadNextPuzzle = useCallback(async () => {
    setLoadingPuzzle(true);
    setError(null);
    try {
      const next = await fetchMateInOnePuzzle();
      setPuzzle(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load a puzzle.');
    } finally {
      setLoadingPuzzle(false);
    }
  }, []);

  // Load the first puzzle on mount
  useEffect(() => {
    loadNextPuzzle();
  }, [loadNextPuzzle]);

  // Countdown
  useEffect(() => {
    if (secondsLeft <= 0) {
      gameOverRef.current(scoreRef.current);
      return;
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  const handleDrop = useCallback(
    (source: string, target: string, piece: string) => {
      if (!puzzle) return false;

      const board = new Chess(puzzle.fen);
      const promotion = piece.toLowerCase().endsWith('p')
        ? undefined
        : piece[1]?.toLowerCase();

      let move;
      try {
        move = board.move({ from: source, to: target, promotion: promotion ?? 'q' });
      } catch {
        return false;
      }
      if (!move) return false;

      const uci = `${move.from}${move.to}${move.promotion ?? ''}`.toLowerCase();

      if (uci === puzzle.solution.toLowerCase()) {
        setScore((s) => s + 1);
        setFeedback('correct');
        setTimeout(() => {
          setFeedback('idle');
          loadNextPuzzle();
        }, 700);
        return true;
      }

      setFeedback('wrong');
      setTimeout(() => setFeedback('idle'), 600);
      return false;
    },
    [puzzle, loadNextPuzzle]
  );

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-6">
      <div className="flex w-full items-center justify-between">
        <div className="text-left">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">Score</p>
          <p className="font-display text-4xl font-semibold tabular-nums">{score}</p>
        </div>
        <Timer secondsLeft={secondsLeft} />
      </div>

      <div className="relative w-full">
        {puzzle && (
          <Board
            fen={puzzle.fen}
            orientation={puzzle.orientation}
            onDrop={handleDrop}
            locked={loadingPuzzle}
          />
        )}

        {!puzzle && !error && (
          <div className="board-frame mx-auto flex aspect-square w-full max-w-[480px] items-center justify-center rounded-2xl">
            <p className="font-mono text-sm text-paper/60">Loading puzzle…</p>
          </div>
        )}

        {error && (
          <div className="board-frame mx-auto flex aspect-square w-full max-w-[480px] flex-col items-center justify-center gap-3 rounded-2xl p-6 text-center">
            <p className="text-sm text-ember">{error}</p>
            <button
              onClick={loadNextPuzzle}
              className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-ink"
            >
              Try again
            </button>
          </div>
        )}
      </div>

      <div className="h-7 font-mono text-sm">
        {feedback === 'correct' && <span className="text-board-dark">Checkmate! ✓</span>}
        {feedback === 'wrong' && <span className="text-ember">Not mate — try again</span>}
        {feedback === 'idle' && puzzle && (
          <span className="text-paper/50">
            Find the mate in 1 — playing as {puzzle.orientation}
          </span>
        )}
      </div>
    </div>
  );
}
