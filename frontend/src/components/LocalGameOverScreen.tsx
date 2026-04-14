import { useEffect, useState } from "react";
import { useStore } from "../store";
import { SYMBOL_COLOR, SYMBOL_BG, SYMBOL_LABEL, PlayerSymbol } from "../types";
import "./LocalGameOverScreen.css";

export default function LocalGameOverScreen() {
  const {
    localPlayers, localWinner, localMoveHistory, localStartedAt, localFinishedAt,
    localLeaderboard, setScreen, localReset,
  } = useStore();
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 80); return () => clearTimeout(t); }, []);

  if (!localPlayers.length) return null;

  const winner = localWinner !== null ? localPlayers[localWinner] : null;
  const col = winner ? SYMBOL_COLOR[winner.symbol as PlayerSymbol] : "var(--ink-2)";
  const duration = localFinishedAt ? Math.round((localFinishedAt - localStartedAt) / 1000) : 0;

  const medals = ["🥇", "🥈", "🥉", "🏅"];

  const playAgain = () => {
    localReset();
    setScreen("local-game");
  };

  return (
    <div className={`lgo ${vis ? "lgo--vis" : ""}`}>
      <div className="lgo-bg" style={{ background: `radial-gradient(circle at 50% 0%, ${col}18 0%, transparent 55%)` }} />

      <div className="lgo-wrap">
        {/* Hero */}
        <div className="lgo-hero" style={{ "--c": col } as React.CSSProperties}>
          <div className="lgo-ring" />
          <div className="lgo-trophy">{winner ? "🏆" : "🤝"}</div>
          <h1 className="lgo-title" style={{ color: winner ? col : "var(--ink-1)" }}>
            {winner ? `${winner.name} Wins!` : "It's a Draw!"}
          </h1>
          <p className="lgo-sub">
            {winner
              ? `${SYMBOL_LABEL[winner.symbol as PlayerSymbol]} got 5 in a row!`
              : "No winner this time"}
          </p>
        </div>

        {/* Match stats */}
        <div className="lgo-stats">
          {[
            { v: localMoveHistory.length, l: "Moves" },
            { v: localPlayers.length, l: "Players" },
            { v: duration + "s", l: "Duration" },
          ].map(({ v, l }) => (
            <div key={l} className="lgo-stat">
              <span className="lgo-stat-v">{v}</span>
              <span className="lgo-stat-l">{l}</span>
            </div>
          ))}
        </div>

        {/* This game result */}
        <div className="lgo-section">
          <p className="lgo-section-label">This Game</p>
          <div className="lgo-ranks">
            {localPlayers.map((p, i) => {
              const pc = SYMBOL_COLOR[p.symbol as PlayerSymbol];
              const pb = SYMBOL_BG[p.symbol as PlayerSymbol];
              const isW = localWinner === i;
              return (
                <div key={p.id} className={`lgo-row ${isW ? "lgo-row--win" : ""}`}
                  style={{ "--c": pc, "--bg": pb } as React.CSSProperties}>
                  <span className="lgo-medal">{isW ? "🥇" : medals[i]}</span>
                  <span className="lgo-rsym">{p.symbol}</span>
                  <span className="lgo-rname">{p.name}</span>
                  {isW && <span className="lgo-winner-tag">WINNER</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Session leaderboard */}
        {localLeaderboard.length > 0 && (
          <div className="lgo-section">
            <p className="lgo-section-label">Session Standings</p>
            <div className="lgo-ranks">
              {localLeaderboard.map((e, i) => {
                const pc = SYMBOL_COLOR[e.symbol as PlayerSymbol];
                const pb = SYMBOL_BG[e.symbol as PlayerSymbol];
                return (
                  <div key={e.id} className="lgo-row" style={{ "--c": pc, "--bg": pb } as React.CSSProperties}>
                    <span className="lgo-medal">{medals[i] ?? `#${i+1}`}</span>
                    <span className="lgo-rsym">{e.symbol}</span>
                    <span className="lgo-rname">{e.name}</span>
                    <span className="lgo-row-stats">{e.wins}W · {e.losses}L · {e.winRate}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="lgo-actions">
          <button className="lgo-btn lgo-btn--again" onClick={playAgain}>↺ Play Again</button>
          <button className="lgo-btn lgo-btn--setup" onClick={() => setScreen("local-setup")}>⚙ Change Players</button>
          <button className="lgo-btn lgo-btn--home" onClick={() => setScreen("home")}>⌂ Main Menu</button>
        </div>
      </div>
    </div>
  );
}
