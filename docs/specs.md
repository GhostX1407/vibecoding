# 🔧 Technical Specifications — Infinite Tic-Tac-Toe

## Frontend

### Screen Flow

```
Home
 ├── Local Multiplayer → LocalSetup → LocalGame → LocalGameOver
 │                                       ↑ (Play Again loops back)
 ├── Online Multiplayer → OnlineSetup → Lobby → Game → GameOver
 └── Leaderboard (accessible from Home and GameOver screens)
```

### Component Tree

```
App
├── HomeScreen
├── OnlineSetupScreen      (formerly: part of HomeScreen)
├── LocalSetupScreen
├── LobbyScreen            (online only)
├── GameScreen             (online game HUD + InfiniteBoard)
│   └── InfiniteBoard      (canvas, zoom/pan, online board)
├── LocalGameScreen        (local game HUD + LocalBoard)
│   └── LocalBoard         (canvas, zoom/pan, local board)
├── GameOverScreen         (online)
├── LocalGameOverScreen    (local)
├── LeaderboardScreen      (tabs: Global | Local Session)
└── Notification           (toast overlay)
```

### Zustand Store Shape

```typescript
// Navigation
screen: Screen
gameMode: "local" | "online" | null

// Online multiplayer
playerId: string          // from sessionStorage — tab-scoped
playerName: string        // from localStorage
roomCode: string
myPlayer: Player | null
roomInfo: RoomInfo | null
match: Match | null
winner: Player | null
winningCells: string[]

// Local multiplayer
localPlayers: LocalPlayer[]
localBoard: Record<string, number>   // "x,y" → playerIndex
localCurrentTurn: number
localMoveHistory: { x, y, playerIdx }[]
localWinner: number | null           // playerIndex
localWinningCells: string[]
localStartedAt: number
localFinishedAt: number | null

// Local leaderboard (session only)
localLeaderboard: LocalLeaderboardEntry[]

// UI
notification: { message, type } | null
```

### Canvas Board Specification

| Property | Value |
|---|---|
| Cell size | 54px at scale 1.0 |
| Minimum scale | 0.05 (5%) |
| Maximum scale | 3.0 (300%) |
| Zoom input | Mouse wheel, pinch gesture |
| Pan input | Click-drag, one-finger drag |
| Background | Warm cream `#f5f0e8` |
| Minor grid | `#e0d8cc`, 0.8px |
| Major grid (every 5) | `#cdc4b4`, 1.0px |
| Origin axes | `#b8ae9c`, 1.5px |
| Coordinate labels | Shown at scale > 1.5 |
| Win flash interval | 520ms |
| Animation | `requestAnimationFrame` loop |
| Resize | `ResizeObserver` on container div |

### Player ID Strategy

| Storage | Scope | Purpose |
|---|---|---|
| `sessionStorage.tabPlayerId` | Per browser tab | Online player identity — new tab = new player |
| `localStorage.playerName` | Per browser | Remembers name between sessions |
| `crypto.randomUUID()` | Per local setup | Local player identity for a single session |

---

## Backend

### REST Endpoints

| Method | Path | Description | Response |
|---|---|---|---|
| GET | `/health` | Server status check | `{ status, timestamp }` |
| GET | `/leaderboard` | All players sorted by ELO | `LeaderboardEntry[]` |
| POST | `/leaderboard/reset` | Wipe all ratings and stats | `{ success, message }` |

### Socket.io Events

#### Client → Server

| Event | Payload | Description |
|---|---|---|
| `create_room` | `{ playerName }` | Creates a new room, auto-joins |
| `join_room` | `{ code, playerName, playerId }` | Joins existing room |
| `start_game` | `{ code }` | Host starts the game (min 2 players) |
| `move` | `{ code, x, y }` | Place a symbol at grid coordinates |

#### Server → Client

| Event | Payload | Description |
|---|---|---|
| `room_created` | `{ code }` | Room created, triggers auto-join |
| `joined` | `{ player, roomInfo }` | Player successfully joined |
| `room_updated` | `RoomInfo` | Player list changed |
| `game_started` | `{ match }` | Game begins, sent to all in room |
| `match_updated` | `{ match }` | Board state after any move |
| `game_over` | `{ winner, winningCells, match }` | Game finished |
| `player_disconnected` | `{ playerId }` | A player left mid-game |
| `move_error` | `{ message }` | Invalid move attempted |
| `error` | `{ message }` | General error (room not found, full, etc.) |

### ELO Rating Algorithm

Multi-player adaptation of standard Elo:

```
For each player i:
  delta_i = Σ(j≠i) [ K × (score_ij - expected_ij) ] / (n-1)
  new_rating_i = max(800, round(rating_i + delta_i))

where:
  K = 32
  score_ij = 1 if player i won, 0 otherwise
  expected_ij = 1 / (1 + 10^((rating_j - rating_i) / 400))
  n = number of players
```

Starting rating: **1200**
Minimum rating: **800**

### Win Detection Algorithm

```
For each of 4 directions [→, ↓, ↘, ↗]:
  cells = [placed_cell]
  Extend forward while board[next] == symbol
  Extend backward while board[prev] == symbol
  If cells.length >= 5 → WIN, return cells
Return NO WIN
```

Time complexity: O(5 × 4) = O(1) per move check

### Room Lifecycle

```
create_room → room created (empty)
join_room   → player added, symbol assigned (X/O/△/◇ by join order)
start_game  → match created, isStarted = true
  [moves…]
game_over   → ELO updated, match marked finished
disconnect  → if pre-game: player removed, symbols reordered
             if mid-game: player_disconnected event emitted
empty room  → room deleted from memory
```

---

## Data Types

### Shared (frontend `types.ts` mirrors backend `match.types.ts`)

```typescript
type PlayerSymbol = "X" | "O" | "△" | "◇"

interface Player {
  id: string; socketId: string; name: string; symbol: PlayerSymbol;
  rating: number; wins: number; losses: number; gamesPlayed: number;
}

interface Match {
  id: string; roomCode: string; players: Player[];
  board: Record<string, PlayerSymbol>;   // "x,y" → symbol
  moveHistory: Move[];
  currentTurn: number;                   // index into players[]
  winner: string | null;                 // playerId
  winningCells: string[];                // ["x,y", ...]
  isFinished: boolean;
  startedAt: number; finishedAt: number | null;
}

interface LocalPlayer {
  id: string; name: string; symbol: PlayerSymbol;
}

interface LocalLeaderboardEntry {
  id: string; name: string; symbol: PlayerSymbol;
  wins: number; losses: number; gamesPlayed: number; winRate: number;
}
```

---

## Design System

### Color Palette

```css
/* Surfaces — warm earthy mid-tones */
--bg-0: #f0ebe3   /* page background */
--bg-1: #e8e0d4   /* slightly deeper */
--bg-2: #ddd5c7   /* card surfaces */
--bg-3: #d0c8b8   /* pressed / input */

/* Ink — deep warm navy (not pure black) */
--ink-0: #1c1f2e  /* headings */
--ink-1: #2d3348  /* primary text */
--ink-2: #4a5068  /* secondary text */
--ink-3: #7a8099  /* muted / labels */
--ink-4: #a8afc4  /* placeholder */

/* Player accents */
--p1: #e85d3a  /* coral   — Cross    */
--p2: #3a7de8  /* cobalt  — Circle   */
--p3: #2eb87a  /* green   — Triangle */
--p4: #9b5de5  /* violet  — Diamond  */

/* Special */
--gold: #d4a017
```

### Typography

| Token | Value |
|---|---|
| `--font` | `DM Sans`, system-ui, sans-serif |
| `--mono` | `DM Mono`, Courier New, monospace |
| Heading XL | 52px, weight 700, tracking -1.5px |
| Heading L | 24–28px, weight 700, tracking -0.4px |
| Body | 14–15px, weight 400, line-height 1.6 |
| Label | 10–12px, weight 600, tracking 0.8px, uppercase |
| Mono | 12–14px (DM Mono) |

### Border Radius

```css
--r-sm: 8px
--r-md: 14px
--r-lg: 20px
--r-xl: 28px
```
