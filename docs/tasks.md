# ✅ Task Tracker — Infinite Tic-Tac-Toe

## Status Key
- ✅ Done
- 🔄 In Progress
- ⬜ Not Started
- 🐛 Bug / Fix Needed

---

## v1.0 — Core Online Multiplayer

### Backend
- ✅ Express server with CORS
- ✅ Socket.io gateway setup
- ✅ Room creation with unique 5-char code generation
- ✅ Room joining with player symbol assignment (X/O/△/◇)
- ✅ Game start (host-controlled, min 2 players)
- ✅ Move validation (turn order, cell occupancy)
- ✅ 5-in-a-row win detection (4 directions)
- ✅ Match state broadcast to all room members
- ✅ Player disconnect handling (pre-game and mid-game)
- ✅ ELO rating system (multi-player adaptation)
- ✅ `GET /leaderboard` REST endpoint
- ✅ TypeScript strict mode — zero compile errors

### Frontend
- ✅ Home screen with room create/join forms
- ✅ Lobby screen with player list and room code display
- ✅ Infinite canvas board (HTML5 Canvas)
- ✅ Mouse zoom (scroll wheel) and pan (click-drag)
- ✅ Touch zoom (pinch) and pan (one-finger drag)
- ✅ Zoom control buttons (+/−/reset/center)
- ✅ Game HUD showing all players and active turn
- ✅ Automatic win detection and winning cell highlight
- ✅ Game over screen with match stats
- ✅ Global leaderboard screen with podium and table
- ✅ Toast notification system
- ✅ TypeScript strict mode — zero compile errors

---

## v2.0 — Bug Fixes + Theme

### Bugs Fixed
- ✅ **Same-browser tabs shared one player ID** — switched to `sessionStorage` (tab-scoped)
- ✅ **Marks disappeared between turns** — removed conditional rendering, board always drawn in full
- ✅ **Dark theme too heavy** — replaced with warm earthy × electric ink mid-tone palette

### Theme
- ✅ New warm cream background palette (`#f0ebe3` → `#d0c8b8`)
- ✅ Deep warm navy ink text (not pure black)
- ✅ Electric accent colors per player (coral, cobalt, green, violet)
- ✅ DM Sans + DM Mono font pair (Google Fonts)
- ✅ Consistent border-radius tokens (sm/md/lg/xl)
- ✅ Canvas board recolored to warm cream with earth-tone grid lines

---

## v3.0 — Local Multiplayer + Dual Leaderboard

### Local Multiplayer
- ✅ Mode selection home screen (Local vs Online vs Leaderboard)
- ✅ Local setup screen — choose 2/3/4 players, enter all names upfront
- ✅ LocalBoard canvas component (reads from Zustand local state)
- ✅ LocalGameScreen HUD — shows all players, active turn indicator
- ✅ Local win detection in Zustand `localMakeMove()` action (pure client-side)
- ✅ LocalGameOverScreen — winner display, session leaderboard, play-again / change-players
- ✅ Local leaderboard tracks W/L/win-rate across multiple games in a session
- ✅ Local state resets on "Play Again" (board cleared, same players)
- ✅ "Change Players" returns to setup screen for fresh names

### Dual Leaderboard
- ✅ Leaderboard screen split into two tabs: Global (online ELO) and Local (session)
- ✅ Global tab — existing ELO table with podium, fetched from backend
- ✅ Local tab — W/L/win-rate table for current session players
- ✅ **Reset Global Leaderboard** button with two-tap confirmation
- ✅ **Reset Local Leaderboard** button with two-tap confirmation
- ✅ `POST /leaderboard/reset` backend endpoint wipes all in-memory ratings
- ✅ Local leaderboard is session-only (gone on page close / hard refresh)
- ✅ Cancel button dismisses confirmation state

### Online Setup
- ✅ Extracted into separate `OnlineSetupScreen` component
- ✅ Online mode badge and descriptive copy
- ✅ Tab-scoped player ID tip displayed on screen

---

## Documentation
- ✅ `docs/plan.md` — project overview, architecture, tech choices
- ✅ `docs/specs.md` — full technical specification (API, types, design tokens)
- ✅ `docs/tasks.md` — this task tracker
- ✅ `README.md` — quick start, controls, project structure, GitHub instructions

---

## Known Limitations / Future Work

| Item | Priority | Notes |
|---|---|---|
| Leaderboard persists only in memory | Low | Would need a database (SQLite/Postgres) for persistence across server restarts |
| No spectator mode | Low | Spectators see board but can't move |
| No reconnect after mid-game disconnect | Medium | Player slot becomes inactive; others can still finish |
| No game timer / time-per-turn | Low | Could add countdown per turn |
| No chat | Low | Simple in-game text chat would improve UX |
| Local game — no AI opponent | Medium | Single-player vs bot would need minimax or MCTS |
| Mobile layout for wide screens | Low | Could optimise tablet landscape HUD layout |
| Sound effects | Low | Move click, win jingle |

---

