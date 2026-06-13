import { supabase } from './supabase';
import type { ScoreEntry } from '../types';

const TABLE = 'scores';

export async function submitScore(playerName: string, score: number): Promise<void> {
  const { error } = await supabase.from(TABLE).insert({
    player_name: playerName,
    score,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function getTopScores(limit = 10): Promise<ScoreEntry[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('score', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
