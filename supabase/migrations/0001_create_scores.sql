-- Leaderboard for the Blitz Fathersday mate-in-1 challenge
create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  player_name text not null check (char_length(player_name) between 1 and 24),
  score integer not null check (score >= 0),
  created_at timestamptz not null default now()
);

alter table public.scores enable row level security;

-- This is a small, fun, family-facing leaderboard with no auth: allow
-- anyone holding the publishable anon key to read and add entries.
create policy "Anyone can read scores"
  on public.scores
  for select
  to anon
  using (true);

create policy "Anyone can add a score"
  on public.scores
  for insert
  to anon
  with check (true);
