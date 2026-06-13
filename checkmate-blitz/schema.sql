-- Run this in your Supabase SQL editor (Dashboard → SQL Editor → New query)

create table if not exists scores (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  score integer not null,
  created_at timestamptz default now()
);

-- Allow anyone to read scores (for the leaderboard)
alter table scores enable row level security;

create policy "Anyone can read scores"
  on scores for select
  using (true);

create policy "Anyone can insert scores"
  on scores for insert
  with check (true);

-- Index for fast leaderboard queries
create index scores_score_idx on scores (score desc);
