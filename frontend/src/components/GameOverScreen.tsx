import { useEffect, useState } from "react";
import { useStore } from "../store";
import { SYMBOL_COLOR, SYMBOL_BG, SYMBOL_LABEL, PlayerSymbol } from "../types";
import "./GameOverScreen.css";

export default function GameOverScreen() {
  const { winner, match, setScreen, myPlayer } = useStore();
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 80); return () => clearTimeout(t); }, []);

  if (!match || !winner) return null;

  const isWinner = winner.id === myPlayer?.id;
  const col = SYMBOL_COLOR[winner.symbol as PlayerSymbol];
  const bg  = SYMBOL_BG[winner.symbol as PlayerSymbol];

  const duration = match.finishedAt
    ? Math.round((match.finishedAt - match.startedAt) / 1000)
    : 0;

  const medals = ["🥇", "🥈", "🥉", "🏅"];

  return (
    <div className={`go ${vis ? "go--vis" : ""}`}>
      {/* Background accent */}
      <div className="go-bg" style={{ background: `radial-gradient(circle at 50% 0%, ${col}18 0%, transparent 60%)` }} />

      <div className="go-wrap">
        {/* Hero */}
        <div className="go-hero" style={{ "--c": col, "--bg": bg } as React.CSSProperties}>
          <div className="go-trophy-ring" />
          <div className="go-trophy">{isWinner ? "🏆" : winner.symbol}</div>
          <div className="go-hero-text">
            <h1 className={`go-title ${isWinner ? "go-title--win" : ""}`}>
              {isWinner ? "You Won!" : "Game Over"}
            </h1>
            <p className="go-sub">
              {isWinner
                ? "Congratulations — you got 5 in a row!"
                : <><strong style={{ color: col }}>{winner.name}</strong> wins with 5 in a row!</>}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="go-stats">
          {[
            { v: match.moveHistory.length, l: "Moves" },
            { v: match.players.length, l: "Players" },
            { v: duration + "s", l: "Duration" },
          ].map(({ v, l }) => (
            <div key={l} className="go-stat">
              <span className="go-stat-v">{v}</span>
              <span className="go-stat-l">{l}</span>
            </div>
          ))}
        </div>

        {/* Rankings */}
        <div className="go-section">
          <p className="go-section-title">Final Standings</p>
          <div className="go-rankings">
            {match.players.map((p, i) => {
              const pc = SYMBOL_COLOR[p.symbol as PlayerSymbol];
              const pb = SYMBOL_BG[p.symbol as PlayerSymbol];
              const isW = p.id === winner.id;
              return (
                <div key={p.id} className={`go-row ${isW ? "go-row--win" : ""}`}
                  style={{ "--c": pc, "--bg": pb } as React.CSSProperties}>
                  <span className="go-medal">{medals[i]}</span>
                  <span className="go-row-sym">{p.symbol}</span>
                  <span className="go-row-name">{p.name}</span>
                  <span className="go-row-elo">{p.rating} ELO</span>
                  {isW && <span className="go-winner-tag">WINNER</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="go-actions">
          <button className="go-btn go-btn--home" onClick={() => setScreen("home")}>
            ← Main Menu
          </button>
          <button className="go-btn go-btn--lb" onClick={() => setScreen("leaderboard")}>
            ★ Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}
