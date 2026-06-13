import { Chess } from 'chess.js';
import { supabase } from './supabase';
import type { Puzzle } from '../types';

const FUNCTION_NAME = 'lichess-proxy';

interface LichessPuzzleResponse {
  game: {
    pgn: string;
  };
  puzzle: {
    id: string;
    rating: number;
    solution: string[];
    initialPly: number;
  };
}

/**
 * Fetches a random mate-in-1 puzzle via the lichess-proxy edge function and
 * derives the FEN position the player should be shown, plus the winning
 * move in UCI notation.
 */
export async function fetchMateInOnePuzzle(): Promise<Puzzle> {
  const { data, error } = await supabase.functions.invoke<LichessPuzzleResponse>(FUNCTION_NAME);

  if (error || !data) {
    throw new Error(error?.message ?? 'Could not reach the puzzle service.');
  }

  const { game, puzzle } = data;

  if (!puzzle?.solution?.length) {
    throw new Error('Puzzle response was missing a solution.');
  }

  // Replay the game from the start up to (but not including) the puzzle
  // position, so we land exactly on the FEN the player needs to solve.
  const replay = new Chess();
  replay.loadPgn(game.pgn);
  const history = replay.history({ verbose: true });

  const board = new Chess();
  for (let i = 0; i < puzzle.initialPly; i++) {
    const move = history[i];
    board.move({ from: move.from, to: move.to, promotion: move.promotion });
  }

  return {
    id: puzzle.id,
    fen: board.fen(),
    solution: puzzle.solution[0],
    orientation: board.turn() === 'w' ? 'white' : 'black',
    rating: puzzle.rating,
  };
}
