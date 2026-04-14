export type PlayerSymbol = "X" | "O" | "△" | "◇";
export const SYMBOLS: PlayerSymbol[] = ["X", "O", "△", "◇"];

export const SYMBOL_COLOR: Record<PlayerSymbol, string> = {
  X: "var(--p1)", O: "var(--p2)", "△": "var(--p3)", "◇": "var(--p4)",
};
export const SYMBOL_BG: Record<PlayerSymbol, string> = {
  X: "var(--p1-bg)", O: "var(--p2-bg)", "△": "var(--p3-bg)", "◇": "var(--p4-bg)",
};
export const SYMBOL_GLOW: Record<PlayerSymbol, string> = {
  X: "var(--p1-glow)", O: "var(--p2-glow)", "△": "var(--p3-glow)", "◇": "var(--p4-glow)",
};
export const SYMBOL_HEX: Record<PlayerSymbol, string> = {
  X: "#e85d3a", O: "#3a7de8", "△": "#2eb87a", "◇": "#9b5de5",
};
export const SYMBOL_LABEL: Record<PlayerSymbol, string> = {
  X: "Cross", O: "Circle", "△": "Triangle", "◇": "Diamond",
};

export interface Player {
  id: string; socketId: string; name: string; symbol: PlayerSymbol;
  rating: number; wins: number; losses: number; gamesPlayed: number;
}
export interface Move {
  x: number; y: number; symbol: PlayerSymbol; playerId: string; timestamp: number;
}
export interface Match {
  id: string; roomCode: string; players: Player[];
  board: Record<string, PlayerSymbol>; moveHistory: Move[];
  currentTurn: number; winner: string | null; winningCells: string[];
  isFinished: boolean; startedAt: number; finishedAt: number | null;
}
export interface RoomInfo {
  code: string; playerCount: number; maxPlayers: number; isStarted: boolean;
  players: Array<{ name: string; symbol: PlayerSymbol; rating: number }>;
}
export interface LeaderboardEntry {
  id: string; name: string; rating: number;
  wins: number; losses: number; gamesPlayed: number; winRate: number;
}

// Local multiplayer types
export interface LocalPlayer {
  id: string;           // uuid generated at setup
  name: string;
  symbol: PlayerSymbol;
}

export interface LocalLeaderboardEntry {
  id: string;
  name: string;
  symbol: PlayerSymbol;
  wins: number;
  losses: number;
  gamesPlayed: number;
  winRate: number;
}
