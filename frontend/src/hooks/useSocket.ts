import { useEffect } from "react";
import { socket } from "../socket";
import { useStore } from "../store";
import { Player, RoomInfo, Match } from "../types";

export function useSocket() {
  const {
    playerId, playerName,
    setScreen, setMyPlayer, setRoomInfo, setRoomCode,
    setMatch, setWinner, setWinningCells, setNotification,
  } = useStore();

  useEffect(() => {
    socket.on("room_created", ({ code }: { code: string }) => {
      socket.emit("join_room", { code, playerName, playerId });
    });

    socket.on("joined", ({ player, roomInfo }: { player: Player; roomInfo: RoomInfo }) => {
      setMyPlayer(player);
      setRoomInfo(roomInfo);
      setRoomCode(roomInfo.code);
      setScreen("lobby");
    });

    socket.on("room_updated", (roomInfo: RoomInfo) => setRoomInfo(roomInfo));

    socket.on("game_started", ({ match }: { match: Match }) => {
      setMatch(match);
      setScreen("game");
    });

    // KEY FIX: match_updated always updates board so ALL players see marks immediately
    socket.on("match_updated", ({ match }: { match: Match }) => setMatch(match));

    socket.on("game_over", ({ winner, winningCells, match }: { winner: Player; winningCells: string[]; match: Match }) => {
      setMatch(match);
      setWinner(winner);
      setWinningCells(winningCells);
      setTimeout(() => setScreen("gameover"), 900);
    });

    socket.on("player_disconnected", () =>
      setNotification({ message: "A player disconnected from the game.", type: "info" })
    );
    socket.on("move_error", ({ message }: { message: string }) =>
      setNotification({ message, type: "error" })
    );
    socket.on("error", ({ message }: { message: string }) =>
      setNotification({ message, type: "error" })
    );

    return () => {
      socket.off("room_created"); socket.off("joined"); socket.off("room_updated");
      socket.off("game_started"); socket.off("match_updated"); socket.off("game_over");
      socket.off("player_disconnected"); socket.off("move_error"); socket.off("error");
    };
  }, [playerId, playerName]);
}
