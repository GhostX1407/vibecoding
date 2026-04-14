import { create } from "zustand";
import { Match, Player, RoomInfo, LocalPlayer, LocalLeaderboardEntry } from "./types";

export type Screen =
  | "home"
  | "mode-select"       // choose Local vs Online
  | "local-setup"       // enter player names for local game
  | "lobby"             // online waiting room
  | "game"              // online game
  | "local-game"        // local game (same tab)
  | "gameover"          // online game over
  | "local-gameover"    // local game over
  | "leaderboard";      // combined leaderboard screen

export type GameMode = "local" | "online" | null;

interface GameStore {
  screen: Screen;
  setScreen: (s: Screen) => void;

  gameMode: GameMode;
  setGameMode: (m: GameMode) => void;

  // ── Online multiplayer state ──
  playerId: string;
  playerName: string;
  setPlayerName: (n: string) => void;
  roomCode: string;
  setRoomCode: (c: string) => void;
  myPlayer: Player | null;
  setMyPlayer: (p: Player) => void;
  roomInfo: RoomInfo | null;
  setRoomInfo: (r: RoomInfo) => void;
  match: Match | null;
  setMatch: (m: Match) => void;
  winner: Player | null;
  setWinner: (p: Player | null) => void;
  winningCells: string[];
  setWinningCells: (c: string[]) => void;

  // ── Local multiplayer state ──
  localPlayers: LocalPlayer[];
  setLocalPlayers: (players: LocalPlayer[]) => void;

  localBoard: Record<string, number>;        // cellKey -> playerIndex
  localCurrentTurn: number;
  localMoveHistory: { x: number; y: number; playerIdx: number }[];
  localWinner: number | null;               // playerIndex or null
  localWinningCells: string[];
  localStartedAt: number;
  localFinishedAt: number | null;

  localMakeMove: (x: number, y: number) => void;
  localReset: () => void;

  // ── Local leaderboard (session only, wiped on reset) ──
  localLeaderboard: LocalLeaderboardEntry[];
  addLocalResult: (winnerIdx: number | null, players: LocalPlayer[]) => void;
  resetLocalLeaderboard: () => void;

  notification: { message: string; type: "error" | "info" | "success" } | null;
  setNotification: (n: GameStore["notification"]) => void;
}

// Tab-scoped ID for online play
const tabId = sessionStorage.getItem("tabPlayerId");
const playerId = tabId || crypto.randomUUID();
if (!tabId) sessionStorage.setItem("tabPlayerId", playerId);

const savedName = localStorage.getItem("playerName") || "";

// ── 5-in-a-row win check (pure, used by local game) ──
function checkWinLocal(
  board: Record<string, number>,
  x: number,
  y: number,
  playerIdx: number
): { won: boolean; cells: string[] } {
  const DIRS = [[1,0],[0,1],[1,1],[1,-1]];
  const key = (cx: number, cy: number) => `${cx},${cy}`;
  for (const [dx, dy] of DIRS) {
    const cells: string[] = [key(x, y)];
    let nx = x + dx, ny = y + dy;
    while (board[key(nx, ny)] === playerIdx) { cells.push(key(nx, ny)); nx += dx; ny += dy; }
    nx = x - dx; ny = y - dy;
    while (board[key(nx, ny)] === playerIdx) { cells.push(key(nx, ny)); nx -= dx; ny -= dy; }
    if (cells.length >= 5) return { won: true, cells };
  }
  return { won: false, cells: [] };
}

const emptyLocalState = {
  localBoard: {} as Record<string, number>,
  localCurrentTurn: 0,
  localMoveHistory: [] as { x: number; y: number; playerIdx: number }[],
  localWinner: null as number | null,
  localWinningCells: [] as string[],
  localStartedAt: 0,
  localFinishedAt: null as number | null,
};

export const useStore = create<GameStore>((set, get) => ({
  screen: "home",
  setScreen: (screen) => set({ screen }),

  gameMode: null,
  setGameMode: (gameMode) => set({ gameMode }),

  // Online
  playerId,
  playerName: savedName,
  setPlayerName: (playerName) => {
    localStorage.setItem("playerName", playerName);
    set({ playerName });
  },
  roomCode: "",
  setRoomCode: (roomCode) => set({ roomCode }),
  myPlayer: null,
  setMyPlayer: (myPlayer) => set({ myPlayer }),
  roomInfo: null,
  setRoomInfo: (roomInfo) => set({ roomInfo }),
  match: null,
  setMatch: (match) => set({ match }),
  winner: null,
  setWinner: (winner) => set({ winner }),
  winningCells: [],
  setWinningCells: (winningCells) => set({ winningCells }),

  // Local players
  localPlayers: [],
  setLocalPlayers: (localPlayers) => set({ localPlayers }),

  // Local game state
  ...emptyLocalState,

  localMakeMove: (x, y) => {
    const { localBoard, localCurrentTurn, localPlayers, localWinner, localMoveHistory } = get();
    if (localWinner !== null) return;
    const key = `${x},${y}`;
    if (localBoard[key] !== undefined) return;

    const newBoard = { ...localBoard, [key]: localCurrentTurn };
    const newHistory = [...localMoveHistory, { x, y, playerIdx: localCurrentTurn }];
    const { won, cells } = checkWinLocal(newBoard, x, y, localCurrentTurn);

    if (won) {
      set({
        localBoard: newBoard,
        localMoveHistory: newHistory,
        localWinner: localCurrentTurn,
        localWinningCells: cells,
        localFinishedAt: Date.now(),
      });
      // Record result in local leaderboard
      get().addLocalResult(localCurrentTurn, localPlayers);
      setTimeout(() => get().setScreen("local-gameover"), 800);
    } else {
      set({
        localBoard: newBoard,
        localMoveHistory: newHistory,
        localCurrentTurn: (localCurrentTurn + 1) % localPlayers.length,
      });
    }
  },

  localReset: () => set({ ...emptyLocalState, localStartedAt: Date.now() }),

  // Local leaderboard
  localLeaderboard: [],
  addLocalResult: (winnerIdx, players) => {
    const { localLeaderboard } = get();
    const updated = [...localLeaderboard];
    players.forEach((p, i) => {
      const existing = updated.find(e => e.id === p.id);
      if (existing) {
        existing.gamesPlayed++;
        if (i === winnerIdx) existing.wins++;
        else existing.losses++;
        existing.winRate = Math.round((existing.wins / existing.gamesPlayed) * 100);
      } else {
        updated.push({
          id: p.id,
          name: p.name,
          symbol: p.symbol,
          wins: i === winnerIdx ? 1 : 0,
          losses: i === winnerIdx ? 0 : 1,
          gamesPlayed: 1,
          winRate: i === winnerIdx ? 100 : 0,
        });
      }
    });
    updated.sort((a, b) => b.wins - a.wins || a.losses - b.losses);
    set({ localLeaderboard: updated });
  },
  resetLocalLeaderboard: () => set({ localLeaderboard: [] }),

  notification: null,
  setNotification: (notification) => {
    set({ notification });
    if (notification) setTimeout(() => set({ notification: null }), 3500);
  },
}));
