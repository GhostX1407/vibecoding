import { useStore } from "../store";
import { SYMBOL_COLOR, SYMBOL_BG, SYMBOL_LABEL, PlayerSymbol } from "../types";
import LocalBoard from "./LocalBoard";
import "./LocalGameScreen.css";

export default function LocalGameScreen() {
  const {
    localPlayers, localCurrentTurn, localWinner,
    localMoveHistory, setScreen,
  } = useStore();

  if (!localPlayers.length) return null;

  const cp = localPlayers[localCurrentTurn];
  const isFinished = localWinner !== null;

  return (
    <div className="lgs">
      {/* Top bar */}
      <div className="lgs-bar">
        <div className="lgs-players">
          {localPlayers.map((p, i) => {
            const active = localCurrentTurn === i && !isFinished;
            const col = SYMBOL_COLOR[p.symbol as PlayerSymbol];
            const bg = SYMBOL_BG[p.symbol as PlayerSymbol];
            return (
              <div
                key={p.id}
                className={`lgsp ${active ? "lgsp--active" : ""}`}
                style={{ "--c": col, "--bg": bg } as React.CSSProperties}
              >
                {active && <span className="lgsp-shimmer" />}
                <span className="lgsp-sym">{p.symbol}</span>
                <div className="lgsp-info">
                  <span className="lgsp-name">{p.name}</span>
                  <span className="lgsp-label">{SYMBOL_LABEL[p.symbol as PlayerSymbol]}</span>
                </div>
                {active && <span className="lgsp-dot" />}
              </div>
            );
          })}
        </div>

        <div className={`lgs-status ${!isFinished && cp ? "lgs-status--active" : ""}`}>
          {isFinished
            ? "Game over — checking results…"
            : `${cp?.name}'s turn — ${cp?.symbol}`}
        </div>
      </div>

      {/* Board */}
      <div className="lgs-board">
        <LocalBoard />
      </div>
    </div>
  );
}
