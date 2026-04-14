import { socket } from "../socket";
import { useStore } from "../store";
import { SYMBOL_COLOR, SYMBOL_BG, SYMBOL_LABEL, PlayerSymbol } from "../types";
import InfiniteBoard from "./InfiniteBoard";
import "./GameScreen.css";

export default function GameScreen() {
  const { match, myPlayer, roomCode } = useStore();
  if (!match) return null;

  const cp = match.players[match.currentTurn];
  const isMyTurn = !match.isFinished && cp?.symbol === myPlayer?.symbol;
  const mySymbol = myPlayer?.symbol ?? null;

  return (
    <div className="gs">
      {/* Top bar */}
      <div className="gs-bar">
        <div className="gs-players">
          {match.players.map((p, i) => {
            const active = match.currentTurn === i && !match.isFinished;
            const isMe = p.id === myPlayer?.id;
            const col = SYMBOL_COLOR[p.symbol as PlayerSymbol];
            const bg = SYMBOL_BG[p.symbol as PlayerSymbol];
            return (
              <div key={p.id}
                className={`gs-p ${active ? "gs-p--active" : ""} ${isMe ? "gs-p--me" : ""}`}
                style={{ "--c": col, "--bg": bg } as React.CSSProperties}
              >
                {active && <span className="gs-ripple" />}
                <span className="gs-sym">{p.symbol}</span>
                <div className="gs-pinfo">
                  <span className="gs-pname">
                    {p.name}
                    {isMe && <span className="gs-you">you</span>}
                  </span>
                  <span className="gs-pmeta">{SYMBOL_LABEL[p.symbol as PlayerSymbol]}</span>
                </div>
                {active && <span className="gs-turn-dot" />}
              </div>
            );
          })}
        </div>

        {/* Turn status */}
        <div className={`gs-status ${isMyTurn ? "gs-status--mine" : match.isFinished ? "gs-status--done" : ""}`}>
          {match.isFinished
            ? "Game over"
            : isMyTurn
            ? "Your turn — click to place"
            : `${cp?.name}'s turn`}
        </div>
      </div>

      {/* Board */}
      <div className="gs-board">
        <InfiniteBoard
          match={match}
          mySymbol={mySymbol}
          onMove={(x, y) => socket.emit("move", { code: roomCode, x, y })}
        />
      </div>
    </div>
  );
}
