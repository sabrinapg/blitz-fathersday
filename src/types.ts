export interface Puzzle {
  id: string;
  fen: string;
  solution: string; // best move in UCI form, e.g. "e2e4" or "e7e8q"
  orientation: 'white' | 'black';
  rating: number;
}

export interface ScoreEntry {
  id: string;
  player_name: string;
  score: number;
  created_at: string;
}
