# Spotistats

A personal music analytics platform built on the Spotify Web API, providing continuous listening stats that other apps hide behind paywalls. It runs quietly in the background, polling your listening activity every few minutes so your stats are always current — no manual refresh, no subscription required.

## Features

- **Spotify OAuth login** — secure authentication, no passwords ever touch this app
- **Continuous background polling** — a BullMQ worker checks each connected account every 5 minutes for new listening activity, independent of whether you're actively using the app
- **Automatic token refresh** — access tokens are refreshed transparently in the background, no re-login required
- **Real computed stats**, all your own — not Spotify's black-box rankings:
  - Total listening time
  - Unique tracks / artists / albums
  - Top 5 tracks, artists, and albums, each with cover art
- **Persistent, containerized architecture** — one command (`docker-compose up`) boots the entire stack: web server, background worker, PostgreSQL, and Redis

## Built with:

| Layer | Tech |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express (ES modules) |
| Database | PostgreSQL |
| Background jobs | BullMQ, Redis |
| Sessions | express-session, connect-redis (Redis-backed, not in-memory) |
| Auth | Spotify OAuth 2.0 (Authorization Code flow) |
| Infrastructure | Docker, Docker Compose |


The web server and the background worker are deliberately separate processes — the worker's job (polling Spotify, refreshing tokens, writing to Postgres) runs independently of whether anyone is actively using the site, and a slow or failing job never affects the responsiveness of the web app.

<img width="3418" height="1966" alt="Screen Recording 2026-09-12 at 5 25 59 PM" src="https://github.com/user-attachments/assets/9cf76dbf-8ff3-4fef-8374-718bd85b6c47" />


## Getting started

### Prerequisites
- [Docker](https://www.docker.com/) and Docker Compose
- Node.js (for running the frontend dev server)
- A [Spotify Developer](https://developer.spotify.com/dashboard) account and registered app

### Setup

1. Clone the repo:
   ```
   git clone https://github.com/<your-username>/spotistats.git
   cd spotistats
   ```

2. Copy the environment template and fill in your real values:
   ```
   cp server/.env.example server/.env
   ```
   You'll need:
   - `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` — from your Spotify Developer Dashboard
   - `SPOTIFY_REDIRECT_URI` — set to `http://127.0.0.1:3001/auth/callback`
   - `SESSION_SECRET` — any long random string (e.g. `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

3. Start the backend stack:
   ```
   docker-compose up --build
   ```
   This boots the Express server, the BullMQ worker, PostgreSQL, and Redis together.

4. Start the frontend:
   ```
   cd client
   npm install
   npm run dev
   ```

5. Visit `http://127.0.0.1:5173` and log in with Spotify.

## Known limitations

- Spotify's API only exposes a rolling ~50-item "recently played" window — Spotistats can only ever measure what it's actively been able to poll since you connected.
- "Minutes listened" reflects tracks that were played, not confirmed full listens — Spotify doesn't expose skip/stop timing data.
- Currently runs locally only; not yet deployed to a public URL.

## Future Features

- Import Spotify's Extended Streaming History export to backfill historical data
- Genre analysis (pending a separate artist-metadata integration)
- Listening streaks
