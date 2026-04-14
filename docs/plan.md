# 📋 Project Plan — Infinite Tic-Tac-Toe

## Overview

Infinite Tic-Tac-Toe is a real-time multiplayer strategy game played on an infinite zoomable canvas. It supports up to 4 players per game and offers two distinct play modes: **Local Multiplayer** (pass-and-play on one device) and **Online Multiplayer** (multiple browser tabs or devices connected via WebSocket).

---

## Goals

| Priority | Goal |
|---|---|
| P0 | Working 4-player turn-based game with 5-in-a-row win condition |
| P0 | Infinite zoomable/pannable canvas board |
| P0 | Online real-time play via WebSocket (Socket.io) |
| P0 | Local same-device pass-and-play mode |
| P1 | ELO-based global ranking system for online games |
| P1 | Session-scoped local leaderboard |
| P1 | Resettable leaderboards (global and local) |
| P2 | Unique warm earthy visual theme |
| P2 | Mobile touch support (pinch-to-zoom, tap-to-place) |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    BROWSER                          │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │            React SPA (Vite)                 │   │
│  │                                             │   │
│  │  Screens: Home → ModeSelect → Setup →       │   │
│  │           Lobby → Game → GameOver →         │   │
│  │           Leaderboard                       │   │
│  │                                             │   │
│  │  State: Zustand store (all game state)      │   │
│  │  Board: HTML5 Canvas (requestAnimationFrame)│   │
│  │  Network: socket.io-client                  │   │
│  └──────────────┬──────────────────────────────┘   │
│                 │ WebSocket                         │
└─────────────────┼───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│              Node.js Backend                        │
│                                                     │
│  Express REST API                                   │
│    GET  /health          → server status            │
│    GET  /leaderboard     → ELO rankings             │
│    POST /leaderboard/reset → wipe all ratings       │
│                                                     │
│  Socket.io Gateway                                  │
│    create_room    → generates 5-char code           │
│    join_room      → adds player to room             │
│    start_game     → creates match, emits to room    │
│    move           → validates + applies move        │
│    disconnect     → cleans up room/player           │
│                                                     │
│  Services                                           │
│    match.service    → game state, move validation   │
│    win.detector     → 5-in-a-row in any direction   │
│    ranking.service  → multi-player ELO updates      │
└─────────────────────────────────────────────────────┘
```

---

## Game Modes

### Local Multiplayer
- All state managed entirely in Zustand (no server needed)
- 2–4 players enter names on the setup screen
- Players share one device and pass it after each turn
- Win detection runs in the store via `localMakeMove()`
- Results tracked in `localLeaderboard[]` (session memory only)
- Leaderboard resets on user request or page close

### Online Multiplayer
- Each browser **tab** gets a unique ID from `sessionStorage`
- Players join a room via a 5-letter code
- All moves synced via `socket.io` events in real time
- Win detection runs on the server
- ELO updated in-memory after every game
- Global leaderboard available via REST API

---

## Player Symbols & Colors

| Symbol | Name | Color |
|---|---|---|
| X | Cross | Electric Coral `#e85d3a` |
| O | Circle | Electric Cobalt `#3a7de8` |
| △ | Triangle | Forest Green `#2eb87a` |
| ◇ | Diamond | Electric Violet `#9b5de5` |

---

## Win Condition

- **5 symbols in a row** in any of 4 directions: horizontal, vertical, diagonal ↗, diagonal ↘
- Checked after every move by scanning outward from the placed cell in each direction
- Winning cells highlighted with a flashing glow animation

---

## Technology Choices

| Layer | Choice | Reason |
|---|---|---|
| Frontend framework | React 18 | Component model, hooks, fast iteration |
| Build tool | Vite 5 | Fast HMR, small bundle |
| State | Zustand | Minimal boilerplate, no context nesting |
| Canvas | HTML5 Canvas API | Fine-grained control, best perf for infinite grid |
| Backend | Node.js + TypeScript | Same language across stack |
| WebSocket | Socket.io | Room management, reconnection, fallbacks |
| Fonts | DM Sans + DM Mono | Clean, modern, readable at all sizes |

---

## Deployment

- **Backend**: Any Node.js host (Railway, Render, Fly.io). Set `PORT` env var.
- **Frontend**: Any static host (Vercel, Netlify, Cloudflare Pages). Set `VITE_BACKEND_URL`.
- No database required — all state is in-memory. Restart clears online leaderboard.
