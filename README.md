<div align="center">

# ♾️ Infinite Tic-Tac-Toe

### 4-Player · Real-Time Multiplayer · ELO Ranked · Infinite Zoomable Board

![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Socket.io](https://img.shields.io/badge/Socket.io-4.7-010101?style=flat-square&logo=socket.io)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)

A real-time 4-player Tic-Tac-Toe game on an **infinite zoomable canvas**, with automatic win detection and a live ELO ranking system. Features a warm earthy × electric ink visual design.

</div>

---

## ✨ Features

| Feature | Details |
|---|---|
| 🗂️ **Same-browser multi-tab** | Each browser tab is an independent player — open 4 tabs in Chrome and all 4 play! |
| ♾️ **Infinite Board** | Pan and zoom freely — the board has no edges |
| 👥 **4-Player Multiplayer** | Cross ✕ · Circle ○ · Triangle △ · Diamond ◇ |
| ⚡ **Real-Time** | WebSocket sync via Socket.io — every move instant for all players |
| 🏆 **ELO Ranking** | Multi-player ELO rating updates after every game |
| 🎯 **Auto Win Detection** | 5-in-a-row in any direction triggers automatic game over |
| 📊 **Leaderboard** | Live global rankings with win-rate bars and podium display |
| 🎨 **Unique Theme** | Warm earthy cream background with electric ink accent colors |

---

## 🚀 How to Run

### Prerequisites
- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org)
- Two terminal windows

### Step 1 — Install dependencies

```bash
# Terminal 1 — Backend
cd backend
npm install

# Terminal 2 — Frontend
cd frontend
npm install
```

### Step 2 — Start the backend

```bash
# Terminal 1
cd backend
npm run dev
```

You should see:
```
🎮 Infinite Tic-Tac-Toe v2 — port 3001
   http://localhost:3001
```

### Step 3 — Start the frontend

```bash
# Terminal 2
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

### Step 4 — Play with multiple players in the same browser

> **Key feature:** Every browser **tab** is treated as a separate player.
> Open `http://localhost:5173` in **4 different tabs** (all in the same Chrome window) —
> each tab will be its own independent player.

1. Tab 1 → Enter name → **Create Room** → copy the 5-letter code
2. Tab 2, 3, 4 → Enter name → **Join Room** → paste the code
3. Tab 1 → click **Start Game**
4. Each tab plays its own turn!

---

## 🕹️ Controls

| Action | Mouse | Touch |
|---|---|---|
| Place symbol | Left click | Tap |
| Pan board | Click & drag | One-finger drag |
| Zoom | Scroll wheel | Pinch gesture |
| Zoom in/out | `+` / `−` buttons | Tap buttons |
| Reset view | `⊙` button | Tap `⊙` |
| Center on game | `◎` button | Tap `◎` |

---

## 📁 Project Structure

```
infinite-ttt/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── match/
│   │   │   │   ├── match.types.ts        # Shared game types
│   │   │   │   ├── match.service.ts      # Game state + move logic
│   │   │   │   └── win.detector.ts       # 5-in-a-row detection
│   │   │   ├── ranking/
│   │   │   │   └── ranking.service.ts    # Multi-player ELO system
│   │   │   └── realtime/
│   │   │       └── realtime.gateway.ts   # Socket.io room + game events
│   │   ├── app.ts                        # Express + REST API
│   │   └── server.ts                     # HTTP server entry point
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── HomeScreen.tsx/.css        # Landing page
    │   │   ├── LobbyScreen.tsx/.css       # Pre-game waiting room
    │   │   ├── GameScreen.tsx/.css        # In-game HUD
    │   │   ├── InfiniteBoard.tsx/.css     # Canvas board (zoom/pan)
    │   │   ├── GameOverScreen.tsx/.css    # Results screen
    │   │   ├── LeaderboardScreen.tsx/.css # Rankings
    │   │   └── Notification.tsx/.css      # Toast messages
    │   ├── hooks/
    │   │   └── useSocket.ts               # All socket event bindings
    │   ├── store.ts                       # Zustand global state
    │   ├── socket.ts                      # Socket.io client
    │   ├── types.ts                       # Shared TypeScript types
    │   ├── App.tsx                        # Screen router
    │   ├── index.css                      # Design tokens + animations
    │   └── main.tsx
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts
```

---

## 🔧 Configuration

### Change backend port

```bash
PORT=4000 npm run dev
```

### Point frontend to a different backend

Create `frontend/.env`:
```
VITE_BACKEND_URL=http://your-server:3001
```

---

## 🏗️ Tech Stack

| | Technology |
|---|---|
| Backend | Node.js · TypeScript · Express · Socket.io |
| Frontend | React 18 · TypeScript · Vite · Zustand |
| Board | HTML5 Canvas API (custom renderer) |
| Fonts | DM Sans + DM Mono (Google Fonts) |

---

## 🎮 Game Rules

- The board stretches infinitely in every direction
- Players take turns: **✕ → ○ → △ → ◇** (cycles back if fewer than 4)
- First to place **5 symbols in a row** wins (horizontal, vertical, or diagonal)
- All players always see all pieces on the board in real time
- ELO ratings update after each completed game

---


<div align="center">
Made with ♾️
</div>
