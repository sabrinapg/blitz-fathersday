# Blitz Fathersday ♟️

A Father's Day gift: a 5-minute speed challenge where Dad races against the
clock to solve as many **mate-in-1** chess puzzles as he can. Every run is
logged to a leaderboard so future attempts can try to beat the record.

🔗 **Live**: deployed on Vercel, auto-deploys from `main`.

- **Puzzles**: pulled live from the [Lichess Puzzle API](https://lichess.org/api#tag/Puzzles)
  via a Supabase Edge Function (`lichess-proxy`), filtered to the `mateIn1` theme.
  Fetching retries a couple of times with backoff if Lichess is briefly
  unavailable or rate-limiting.
- **Frontend**: React + Vite + Tailwind, board rendered with `react-chessboard`
  and move validation via `chess.js`.
- **Sound**: lightweight synthesized effects (Web Audio API, no external audio
  files) for moves, correct/incorrect answers, the countdown, and game over.
- **Leaderboard**: a `scores` table in Supabase Postgres.

## Project structure

```
.
├── src/
│   ├── components/
│   │   ├── StartScreen.tsx   # name entry + leaderboard preview
│   │   ├── Countdown.tsx     # 3-2-1-Go before the timer starts
│   │   ├── GameScreen.tsx    # timer, pause/resume, score, board
│   │   ├── Board.tsx         # click-to-move + drag chessboard
│   │   ├── Timer.tsx         # chess-clock style countdown display
│   │   ├── EndScreen.tsx     # final score, confetti, leaderboard
│   │   └── Scoreboard.tsx    # leaderboard list
│   └── lib/
│       ├── supabase.ts       # Supabase client
│       ├── puzzles.ts        # fetch + derive puzzle FEN/solution (with retries)
│       ├── scores.ts         # read/write the scores table
│       └── sounds.ts         # synthesized sound effects
└── supabase/
    ├── functions/lichess-proxy/   # Edge function proxying Lichess puzzles
    └── migrations/                # `scores` table + RLS policies
```

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env`:

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

### 3. Set up the database

With the [Supabase CLI](https://supabase.com/docs/guides/cli) linked to your project:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

This creates the `scores` table with policies that let anyone read the
leaderboard and add a new score (no login required — it's a living-room game).

### 4. Deploy the edge function

```bash
supabase functions deploy lichess-proxy
```

The function calls Lichess's public puzzle endpoint and needs no secrets or
auth — it works for anonymous requests.

### 5. Run it

```bash
npm run dev
```

Open the printed local URL, type in a name, hit **Start the Clock**, and go.

## Deploying (Vercel)

This project is set up to deploy on [Vercel](https://vercel.com):

1. Import the GitHub repo as a new Vercel project.
2. Framework preset: **Vite**. Build command: `npm run build`. Output
   directory: `dist`.
3. Add environment variables under **Settings → Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy. Every push to `main` triggers an automatic rebuild.

**Note**: Vite bakes environment variables in at *build time*. If you add or
change env vars after a deploy already exists, trigger a **Redeploy** from the
Deployments tab — just pushing won't retroactively update an existing build.

## How the game works

1. **Start screen** — enter a name (defaults to "Dad") and see the current
   leaderboard.
2. **Countdown** — a quick "3, 2, 1, Go!" before the clock starts.
3. **Game screen** — a 5:00 chess-clock counts down. A mate-in-1 puzzle loads
   on the board, oriented so the player is the side to move. Tap a piece to
   see its legal moves highlighted, then tap a destination — or just drag.
   - Correct → board flashes, "Checkmate! ✓" pops up, score +1, a fresh puzzle
     loads automatically.
   - Incorrect → the board shakes and flashes, then resets so you can try again.
   - **Pause** — the pause button (top right) freezes the timer and dims the
     board for breaks.
4. **End screen** — final score is saved to the leaderboard (with confetti for
   any score above 0) and the updated standings are shown. Hit **Play Again**
   to go another round.

## Ideas for "more things later" 🎁

Some directions that would slot in cleanly with this structure:

- Track puzzle **rating** and show an average difficulty per run.
- Add other puzzle themes (e.g. `mateIn2`, `fork`, `pin`) as selectable modes.
- Show a streak counter or a "personal best" badge per player name.
- A post-game replay of the puzzles attempted, with the correct solutions
  highlighted.
- Multiplayer: two boards side-by-side racing the same puzzle set.