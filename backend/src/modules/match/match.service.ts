import { Match, Player } from "./match.types";
import { checkWin } from "./win.detector";
import { v4 as uuid } from "uuid";
import { getRating, updateRatings } from "../ranking/ranking.service";

const matches = new Map<string, Match>();

export function createMatch(players: Player[]): Match {
  const match: Match = {
    id: uuid(), roomCode: "", players, board: {}, moveHistory: [],
    currentTurn: 0, winner: null, winningCells: [], isFinished: false,
    startedAt: Date.now(), finishedAt: null,
  };
  matches.set(match.id, match);
  return match;
}

export function getMatch(id: string) { return matches.get(id); }

export function makeMove(matchId: string, playerId: string, x: number, y: number): { match: Match; error?: string } {
  const match = matches.get(matchId);
  if (!match) return { match: null as any, error: "Match not found" };
  if (match.isFinished) return { match, error: "Game already finished" };
  const cp = match.players[match.currentTurn];
  if (cp.id !== playerId) return { match, error: "Not your turn" };
  const key = `${x},${y}`;
  if (match.board[key]) return { match, error: "Cell already occupied" };
  match.board[key] = cp.symbol;
  match.moveHistory.push({ x, y, symbol: cp.symbol, playerId: cp.id, timestamp: Date.now() });
  const { won, cells } = checkWin(match.board, x, y, cp.symbol);
  if (won) {
    match.winner = cp.id; match.winningCells = cells;
    match.isFinished = true; match.finishedAt = Date.now();
    updateRatings(match.players.map(p => p.id), cp.id);
    match.players.forEach(p => { p.rating = getRating(p.id); });
  } else {
    match.currentTurn = (match.currentTurn + 1) % match.players.length;
  }
  return { match };
}
