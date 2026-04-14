import { Server, Socket } from "socket.io";
import { createMatch, makeMove } from "../match/match.service";
import { Player, SYMBOLS, RoomInfo } from "../match/match.types";
import { getOrInitPlayer, getRating } from "../ranking/ranking.service";

const MAX_PLAYERS = 4;

interface RoomData {
  players: Player[];
  matchId: string | null;
  isStarted: boolean;
  socketToPlayer: Map<string, string>; // socketId -> playerId (tab-scoped)
}

const rooms = new Map<string, RoomData>();

function getRoomInfo(code: string): RoomInfo | null {
  const room = rooms.get(code);
  if (!room) return null;
  return {
    code, playerCount: room.players.length, maxPlayers: MAX_PLAYERS,
    isStarted: room.isStarted,
    players: room.players.map(p => ({ name: p.name, symbol: p.symbol, rating: p.rating })),
  };
}

function genCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let c = "";
  for (let i = 0; i < 5; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

export function setupSocket(server: any) {
  const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

  io.on("connection", (socket: Socket) => {

    socket.on("create_room", ({ playerName }: { playerName: string }) => {
      let code = genCode();
      while (rooms.has(code)) code = genCode();
      rooms.set(code, { players: [], matchId: null, isStarted: false, socketToPlayer: new Map() });
      socket.emit("room_created", { code });
    });

    // KEY FIX: playerId is now TAB-scoped (sent from sessionStorage on the client)
    // Each browser tab generates its own unique tabId, so same-browser multi-tab works
    socket.on("join_room", ({ code, playerName, playerId }: { code: string; playerName: string; playerId: string }) => {
      const room = rooms.get(code);
      if (!room) { socket.emit("error", { message: "Room not found. Check the code." }); return; }
      if (room.isStarted) { socket.emit("error", { message: "Game already in progress." }); return; }
      if (room.players.length >= MAX_PLAYERS) { socket.emit("error", { message: "Room is full (max 4 players)." }); return; }

      // Check if this exact playerId (tab) is already in room
      const existIdx = room.players.findIndex(p => p.id === playerId);
      if (existIdx !== -1) {
        room.socketToPlayer.set(socket.id, playerId);
        room.players[existIdx].socketId = socket.id;
        socket.join(code);
        socket.emit("joined", { player: room.players[existIdx], roomInfo: getRoomInfo(code) });
        io.to(code).emit("room_updated", getRoomInfo(code));
        return;
      }

      getOrInitPlayer(playerId, playerName);
      const player: Player = {
        id: playerId, socketId: socket.id, name: playerName,
        symbol: SYMBOLS[room.players.length], rating: getRating(playerId),
        wins: 0, losses: 0, gamesPlayed: 0,
      };
      room.players.push(player);
      room.socketToPlayer.set(socket.id, playerId);
      socket.join(code);
      socket.emit("joined", { player, roomInfo: getRoomInfo(code) });
      io.to(code).emit("room_updated", getRoomInfo(code));
    });

    socket.on("start_game", ({ code }: { code: string }) => {
      const room = rooms.get(code);
      if (!room || room.isStarted) return;
      if (room.players.length < 2) { socket.emit("error", { message: "Need at least 2 players." }); return; }
      room.isStarted = true;
      const match = createMatch(room.players);
      match.roomCode = code;
      room.matchId = match.id;
      io.to(code).emit("game_started", { match });
    });

    socket.on("move", ({ code, x, y }: { code: string; x: number; y: number }) => {
      const room = rooms.get(code);
      if (!room || !room.matchId) return;
      const playerId = room.socketToPlayer.get(socket.id);
      if (!playerId) return;
      const { match, error } = makeMove(room.matchId, playerId, x, y);
      if (error) { socket.emit("move_error", { message: error }); return; }
      io.to(code).emit("match_updated", { match });
      if (match.isFinished) {
        io.to(code).emit("game_over", {
          winner: match.players.find(p => p.id === match.winner),
          winningCells: match.winningCells, match,
        });
      }
    });

    socket.on("disconnect", () => {
      for (const [code, room] of rooms.entries()) {
        const playerId = room.socketToPlayer.get(socket.id);
        if (playerId) {
          room.socketToPlayer.delete(socket.id);
          if (!room.isStarted) {
            room.players = room.players.filter(p => p.id !== playerId);
            room.players.forEach((p, i) => { p.symbol = SYMBOLS[i]; });
            io.to(code).emit("room_updated", getRoomInfo(code));
            if (room.players.length === 0) rooms.delete(code);
          } else {
            io.to(code).emit("player_disconnected", { playerId });
          }
        }
      }
    });
  });
}
