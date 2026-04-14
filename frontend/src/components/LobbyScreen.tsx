import { socket } from "../socket";
import { useStore } from "../store";
import { SYMBOL_COLOR, SYMBOL_BG, SYMBOL_LABEL, PlayerSymbol } from "../types";
import "./LobbyScreen.css";

export default function LobbyScreen() {
  const { roomCode, roomInfo, myPlayer } = useStore();

  const filled = roomInfo?.players ?? [];
  const emptySlots = Array(4 - filled.length).fill(null);
  const canStart = (roomInfo?.playerCount ?? 0) >= 2;
  const isHost = filled[0]?.name === myPlayer?.name;

  const copy = () => {
    navigator.clipboard.writeText(roomCode);
  };

  return (
    <div className="lobby">
      <div className="lobby-bg" />

      <div className="lobby-wrap">
        {/* Header */}
        <div className="lobby-top">
          <div>
            <h2 className="lobby-title">Game Lobby</h2>
            <p className="lobby-sub">
              {filled.length}/4 players · {roomInfo?.isStarted ? "Game started" : "Waiting to start"}
            </p>
          </div>
          <div className="lobby-code-box">
            <span className="lobby-code-label">Room Code</span>
            <div className="lobby-code-row">
              <span className="lobby-code">{roomCode}</span>
              <button className="lobby-copy" onClick={copy} title="Copy code">⧉</button>
            </div>
          </div>
        </div>

        {/* Players grid */}
        <div className="lobby-grid">
          {filled.map((player, i) => {
            const col = SYMBOL_COLOR[player.symbol as PlayerSymbol];
            const bg = SYMBOL_BG[player.symbol as PlayerSymbol];
            const isMe = player.name === myPlayer?.name;
            return (
              <div key={i} className={`lp-card ${isMe ? "lp-card--me" : ""}`}
                style={{ "--c": col, "--bg": bg } as React.CSSProperties}>
                <div className="lp-sym">{player.symbol}</div>
                <div className="lp-info">
                  <span className="lp-name">
                    {player.name}
                    {isMe && <span className="lp-you">you</span>}
                  </span>
                  <span className="lp-meta">{SYMBOL_LABEL[player.symbol as PlayerSymbol]} · {player.rating} ELO</span>
                </div>
                <span className="lp-ready">●</span>
              </div>
            );
          })}
          {emptySlots.map((_, i) => (
            <div key={`e${i}`} className="lp-card lp-card--empty">
              <div className="lp-sym lp-sym--empty">?</div>
              <div className="lp-info">
                <span className="lp-name" style={{ color: "var(--ink-4)" }}>Waiting for player…</span>
              </div>
            </div>
          ))}
        </div>

        {/* Action */}
        {isHost ? (
          <button
            className={`lobby-start ${canStart ? "lobby-start--on" : "lobby-start--off"}`}
            onClick={() => socket.emit("start_game", { code: roomCode })}
            disabled={!canStart}
          >
            {canStart ? "▶  Start Game" : "Need at least 2 players to start"}
          </button>
        ) : (
          <p className="lobby-waiting-msg">
            <span className="lobby-dots">···</span> Waiting for the host to start
          </p>
        )}

        {/* Rules */}
        <div className="lobby-rules">
          <p className="lobby-rules-title">How to win</p>
          <ul className="lobby-rules-list">
            <li>Place your symbol on the infinite grid — it scrolls in every direction</li>
            <li>First to get <strong>5 in a row</strong> wins (any direction)</li>
            <li>Scroll to zoom, drag to pan the board</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
