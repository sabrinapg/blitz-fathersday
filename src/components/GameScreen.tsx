import { useCallback, useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import { Pause, Play } from 'lucide-react';
import Board from './Board';
import Timer from './Timer';
import { fetchMateInOnePuzzle } from '../lib/puzzles';
import { playCorrect, playGameOver, playMove, playTick, playWrong } from '../lib/sounds';
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
  const [paused, setPaused] = useState(false);

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
      setError(
        err instanceof Error
          ? err.message
          : 'Could not load a puzzle. Check your connection and try again.'
      );
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
    if (paused) return;

    if (secondsLeft <= 0) {
      playGameOver();
      gameOverRef.current(scoreRef.current);
      return;
    }
    if (secondsLeft <= 10) {
      playTick();
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft, paused]);

  const attemptMove = useCallback(
    (source: string, target: string, promotion?: string) => {
      if (!puzzle || paused) return false;

      const board = new Chess(puzzle.fen);

      const piece = board.get(source as Parameters<typeof board.get>[0]);
      const isPromotion =
        piece?.type === 'p' && (target.endsWith('8') || target.endsWith('1'));

      let move;
      try {
        move = board.move(
          isPromotion
            ? { from: source, to: target, promotion: promotion ?? 'q' }
            : { from: source, to: target }
        );
      } catch {
        return false;
      }
      if (!move) return false;

      const uci = `${move.from}${move.to}${move.promotion ?? ''}`.toLowerCase();

      if (uci === puzzle.solution.toLowerCase()) {
        playCorrect();
        setScore((s) => s + 1);
        setFeedback('correct');
        setTimeout(() => {
          setFeedback('idle');
          loadNextPuzzle();
        }, 700);
        return true;
      }

      playMove();
      playWrong();
      setFeedback('wrong');
      setTimeout(() => setFeedback('idle'), 500);
      return false;
    },
    [puzzle, paused, loadNextPuzzle]
  );

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-4 sm:gap-6">
      <div className="flex w-full items-center justify-between">
        <div className="text-left">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">Score</p>
          <p className="font-display text-2xl font-semibold tabular-nums sm:text-4xl">{score}</p>
        </div>

        <div className="flex items-center gap-3">
          <Timer secondsLeft={secondsLeft} />
          <button
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? 'Resume' : 'Pause'}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 bg-ink-light text-paper transition hover:border-gold/60 hover:text-gold sm:h-12 sm:w-12"
          >
            {paused ? <Play size={18} /> : <Pause size={18} />}
          </button>
        </div>
      </div>

      <div className="relative w-full">
        {puzzle && (
          <Board
            fen={puzzle.fen}
            orientation={puzzle.orientation}
            onMove={attemptMove}
            locked={loadingPuzzle || paused}
            feedback={feedback}
          />
        )}

        {!puzzle && !error && (
          <div className="board-frame mx-auto flex aspect-square w-full max-w-[480px] items-center justify-center rounded-2xl">
            <p className="font-mono text-sm text-paper/60">Loading puzzle…</p>
          </div>
        )}

        {feedback === 'correct' && (
          <div className="pointer-events-none absolute inset-0 z-[999] flex items-center justify-center">
            <span className="animate-pop rounded-full bg-gold px-6 py-2.5 font-display text-2xl font-bold text-ink shadow-2xl sm:px-8 sm:py-3 sm:text-3xl">
              Checkmate! ✓
            </span>
          </div>
        )}

        {paused && puzzle && (
          <div className="absolute inset-0 z-[999] flex flex-col items-center justify-center gap-4 rounded-2xl bg-ink/80 backdrop-blur-sm">
            <p className="font-display text-4xl font-bold text-paper">Paused</p>
            <button
              onClick={() => setPaused(false)}
              className="flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 font-display text-lg font-semibold text-ink transition hover:bg-gold/90"
            >
              <Play size={18} /> Resume
            </button>
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

      <div className="h-7 px-2 text-center font-mono text-xs sm:text-sm">
        {feedback === 'wrong' && <span className="text-ember">Not mate — try again</span>}
        {feedback !== 'wrong' && puzzle && !paused && (
          <span className="text-paper/50">Find mate in 1 as {puzzle.orientation}</span>
        )}
      </div>
    </div>
  );
}