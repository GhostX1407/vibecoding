export type PlayerSymbol = "X" | "O" | "△" | "◇";
export const SYMBOLS: PlayerSymbol[] = ["X", "O", "△", "◇"];

export const SYMBOL_NAMES: Record<PlayerSymbol, string> = {
  X: "Cross", O: "Circle", "△": "Triangle", "◇": "Diamond",
};

export interface Player {
  id: string;
  socketId: string;
  name: string;
  symbol: PlayerSymbol;
  rating: number;
  wins: number;
  losses: number;
  gamesPlayed: number;
}

export type Board = Record<string, PlayerSymbol>;

export interface Move {
  x: number;
  y: number;
  symbol: PlayerSymbol;
  playerId: string;
  timestamp: number;
}

export interface Match {
  id: string;
  roomCode: string;
  players: Player[];
  board: Board;
  moveHistory: Move[];
  currentTurn: number;
  winner: string | null;
  winningCells: string[];
  isFinished: boolean;
  startedAt: number;
  finishedAt: number | null;
}

export interface RoomInfo {
  code: string;
  playerCount: number;
  maxPlayers: number;
  isStarted: boolean;
  players: Array<{ name: string; symbol: PlayerSymbol; rating: number }>;
}
