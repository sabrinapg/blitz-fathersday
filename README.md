# Blitz Fathersday ♟️

A Father's Day gift: a 5-minute speed challenge where Dad races against the
clock to solve as many **mate-in-1** chess puzzles as he can. Every run is
logged to a leaderboard so future attempts can try to beat the record.

- **Puzzles**: pulled live from the [Lichess Puzzle API](https://lichess.org/api#tag/Puzzles)
  via a Supabase Edge Function (`lichess-proxy`), filtered to the `mateIn1` theme.
- **Frontend**: React + Vite + Tailwind, board rendered with `react-chessboard`
  and move validation via `chess.js`.
- **Leaderboard**: a `scores` table in Supabase Postgres.

## Project structure

```
.
├── src/                    # React app
│   ├── components/         # StartScreen, GameScreen, EndScreen, Board, Timer, Scoreboard
│   └── lib/                 # supabase client, puzzle fetching, scoreboard queries
└── supabase/
    ├── functions/lichess-proxy/   # Edge function proxying Lichess puzzles
    └── migrations/                # `scores` table + RLS policies
```

## 1. Install dependencies

```bash
npm install
```

## 2. Configure environment

Copy `.env.example` to `.env` (a working `.env` is already included for this
project's Supabase instance — only do this step if you're pointing at a
different project):

```bash
cp .env.example .env
```

Fill in:

```
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your publishable/anon key>
```

These are safe to expose in a frontend — access is controlled by Row Level
Security policies on the `scores` table, not by hiding this key.

## 3. Set up the database

With the [Supabase CLI](https://supabase.com/docs/guides/cli) linked to your project:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

This creates the `scores` table with policies that let anyone read the
leaderboard and add a new score (no login required — it's a living-room game).

## 4. Deploy the edge function

```bash
supabase functions deploy lichess-proxy
```

The function calls Lichess's public puzzle endpoint and needs no secrets or
auth — it works for anonymous requests.

## 5. Run it

```bash
npm run dev
```

Open the printed local URL, type in a name, hit **Start the Clock**, and go.

## How the game works

1. **Start screen** — enter a name (defaults to "Dad") and see the current
   leaderboard.
2. **Game screen** — a 5:00 chess-clock counts down. A mate-in-1 puzzle loads
   on the board, oriented so the player is the side to move. Drag the piece
   that delivers checkmate.
   - Correct → score +1, a fresh puzzle loads automatically.
   - Incorrect → the board snaps back so you can try again; no penalty.
3. **End screen** — final score is saved to the leaderboard and the updated
   standings are shown. Hit **Play Again** to go another round.

## Ideas for "more things later" 🎁

Some directions that would slot in cleanly with this structure:

- Track puzzle **rating** and show an average difficulty per run.
- Add other puzzle themes (e.g. `mateIn2`, `fork`, `pin`) as selectable modes.
- Show a streak counter or a "personal best" badge per player name.
- Add sound effects for correct/incorrect moves.
- A post-game replay of the puzzles attempted, with the correct solutions
  highlighted.
- Multiplayer: two boards side-by-side racing the same puzzle set.
