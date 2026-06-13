# Checkmate Blitz — Setup Guide

## What you need
- A free Lichess account + API token
- A free Supabase project (already created)

---

## Step 1 — Supabase: create the scores table

1. Go to your Supabase dashboard → **SQL Editor** → **New query**
2. Paste the contents of `schema.sql` and click **Run**

---

## Step 2 — Deploy the Edge Function (Lichess proxy)

Install the Supabase CLI:
```bash
npm install -g supabase
```

Login and link your project:
```bash
supabase login
supabase link --project-ref pkbkdzcoziijcxtfhkuq
```

Set your Lichess token as a secret:
```bash
supabase secrets set LICHESS_TOKEN=your_lichess_token_here
```

Deploy the function:
```bash
supabase functions deploy lichess-proxy
```

---

## Step 3 — Host index.html

You can host `index.html` anywhere — it's a single file:

**Option A: Supabase Storage (simplest)**
1. Go to Supabase → Storage → Create a new public bucket called `site`
2. Upload `index.html`
3. Make it public — share the URL

**Option B: Netlify Drop (easiest)**
1. Go to netlify.com/drop
2. Drag and drop `index.html`
3. Get a shareable URL instantly — no account needed

**Option C: GitHub Pages**
1. Push to a GitHub repo
2. Enable Pages under Settings → Pages

---

## Your config values (already filled in index.html)
- Supabase URL: `https://pkbkdzcoziijcxtfhkuq.supabase.co`
- Supabase anon key: `sb_publishable_ud8SemqvT3gWfXF3nAK8OQ_RQmuJS5P`
- Proxy URL: `https://pkbkdzcoziijcxtfhkuq.supabase.co/functions/v1/lichess-proxy`

The only thing NOT filled in is your Lichess token — that lives as a Supabase secret (Step 2), never in the HTML file.
