import { useEffect, useState, useCallback } from "react";
import { useStore } from "../store";
import { LeaderboardEntry, SYMBOL_COLOR, SYMBOL_BG, PlayerSymbol } from "../types";
import "./LeaderboardScreen.css";

type Tab = "global" | "local";

export default function LeaderboardScreen() {
  const { setScreen, localLeaderboard, resetLocalLeaderboard } = useStore();
  const [tab, setTab] = useState<Tab>("global");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const fetchGlobal = useCallback(() => {
    setLoading(true);
    const url = ((import.meta as any).env?.VITE_BACKEND_URL || "http://localhost:3001") + "/leaderboard";
    fetch(url)
      .then(r => r.json())
      .then(d => { setEntries(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchGlobal(); }, [fetchGlobal]);

  const handleGlobalReset = async () => {
    if (!confirmReset) { setConfirmReset(true); return; }
    setResetting(true);
    const url = ((import.meta as any).env?.VITE_BACKEND_URL || "http://localhost:3001") + "/leaderboard/reset";
    await fetch(url, { method: "POST" }).catch(() => {});
    await fetchGlobal();
    setResetting(false);
    setConfirmReset(false);
  };

  const handleLocalReset = () => {
    if (!confirmReset) { setConfirmReset(true); return; }
    resetLocalLeaderboard();
    setConfirmReset(false);
  };

  // Reset confirm state when switching tabs
  const switchTab = (t: Tab) => { setTab(t); setConfirmReset(false); };

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="lb">
      <div className="lb-wrap">

        {/* Header */}
        <div className="lb-header">
          <button className="lb-back" onClick={() => setScreen("home")}>← Back</button>
          <h1 className="lb-title">Leaderboard</h1>
          <div style={{ width: 72 }} />
        </div>

        {/* Tab switcher */}
        <div className="lb-tabs">
          <button
            className={`lb-tab ${tab === "global" ? "lb-tab--on" : ""}`}
            onClick={() => switchTab("global")}
          >
            🌐 Global
          </button>
          <button
            className={`lb-tab ${tab === "local" ? "lb-tab--on" : ""}`}
            onClick={() => switchTab("local")}
          >
            🖥️ Local Session
          </button>
        </div>

        {/* ── GLOBAL TAB ── */}
        {tab === "global" && (
          <>
            {loading ? (
              <div className="lb-loading">
                <div className="lb-spinner" />
                <span>Loading rankings…</span>
              </div>
            ) : entries.length === 0 ? (
              <div className="lb-empty">
                <p className="lb-empty-icon">📋</p>
                <p>No online games played yet.</p>
                <p>Create a room and play the first game!</p>
              </div>
            ) : (
              <>
                {/* Podium */}
                {entries.length >= 2 && (
                  <div className="lb-podium">
                    {[1, 0, 2].map(pos => {
                      const e = entries[pos];
                      if (!e) return <div key={pos} className="lb-pod" />;
                      const heights = ["56px", "80px", "40px"];
                      return (
                        <div key={pos} className="lb-pod">
                          <div className="lb-pod-badge">{medals[pos]}</div>
                          <div className="lb-pod-name">{e.name}</div>
                          <div className="lb-pod-elo">{e.rating} ELO</div>
                          <div className="lb-pod-bar" style={{ height: heights[pos] }} />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Table */}
                <div className="lb-table">
                  <div className="lb-thead lb-thead--global">
                    <span>#</span><span>Player</span>
                    <span>ELO</span><span>W</span><span>L</span><span>Win %</span>
                  </div>
                  {entries.map((e, i) => (
                    <div key={e.id}
                      className={`lb-row ${i < 3 ? `lb-row--t${i + 1}` : ""}`}
                      style={{ animationDelay: `${i * 0.04}s` }}
                    >
                      <span className="lb-pos">{i < 3 ? medals[i] : i + 1}</span>
                      <span className="lb-name">{e.name}</span>
                      <span className="lb-elo">{e.rating}</span>
                      <span className="lb-w">{e.wins}</span>
                      <span className="lb-l">{e.losses}</span>
                      <span className="lb-wr">
                        <div className="lb-wr-wrap">
                          <div className="lb-wr-fill" style={{ width: `${e.winRate}%` }} />
                          <span className="lb-wr-txt">{e.winRate}%</span>
                        </div>
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Reset global */}
            <div className="lb-reset-zone">
              <p className="lb-reset-info">
                Resets all online ELO ratings and match history permanently.
              </p>
              <button
                className={`lb-reset-btn ${confirmReset ? "lb-reset-btn--confirm" : ""}`}
                onClick={handleGlobalReset}
                disabled={resetting}
              >
                {resetting
                  ? "Resetting…"
                  : confirmReset
                  ? "⚠ Tap again to confirm reset"
                  : "🗑 Reset Global Leaderboard"}
              </button>
              {confirmReset && (
                <button className="lb-cancel-btn" onClick={() => setConfirmReset(false)}>Cancel</button>
              )}
            </div>
          </>
        )}

        {/* ── LOCAL SESSION TAB ── */}
        {tab === "local" && (
          <>
            {localLeaderboard.length === 0 ? (
              <div className="lb-empty">
                <p className="lb-empty-icon">🖥️</p>
                <p>No local games played yet.</p>
                <p>Start a local multiplayer game to see scores here!</p>
                <button
                  className="lb-play-local-btn"
                  onClick={() => setScreen("local-setup")}
                >
                  Play Local Game →
                </button>
              </div>
            ) : (
              <>
                <div className="lb-local-info">
                  Session scores — resets when you clear or close the page
                </div>

                {/* Local podium */}
                {localLeaderboard.length >= 2 && (
                  <div className="lb-podium">
                    {[1, 0, 2].map(pos => {
                      const e = localLeaderboard[pos];
                      if (!e) return <div key={pos} className="lb-pod" />;
                      const col = SYMBOL_COLOR[e.symbol as PlayerSymbol];
                      const bg = SYMBOL_BG[e.symbol as PlayerSymbol];
                      const heights = ["56px", "80px", "40px"];
                      return (
                        <div key={pos} className="lb-pod" style={{ "--c": col, "--bg": bg } as React.CSSProperties}>
                          <div className="lb-pod-badge">{medals[pos]}</div>
                          <div className="lb-pod-sym">{e.symbol}</div>
                          <div className="lb-pod-name">{e.name}</div>
                          <div className="lb-pod-elo">{e.wins}W / {e.losses}L</div>
                          <div className="lb-pod-bar" style={{ height: heights[pos] }} />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Local table */}
                <div className="lb-table">
                  <div className="lb-thead lb-thead--local">
                    <span>#</span><span>Player</span>
                    <span>W</span><span>L</span><span>Games</span><span>Win %</span>
                  </div>
                  {localLeaderboard.map((e, i) => {
                    const col = SYMBOL_COLOR[e.symbol as PlayerSymbol];
                    const bg  = SYMBOL_BG[e.symbol as PlayerSymbol];
                    return (
                      <div key={e.id}
                        className={`lb-row lb-row--local ${i < 3 ? `lb-row--t${i + 1}` : ""}`}
                        style={{ "--c": col, "--bg": bg, animationDelay: `${i * 0.04}s` } as React.CSSProperties}
                      >
                        <span className="lb-pos">{i < 3 ? medals[i] : i + 1}</span>
                        <span className="lb-name">
                          <span className="lb-local-sym">{e.symbol}</span>
                          {e.name}
                        </span>
                        <span className="lb-w">{e.wins}</span>
                        <span className="lb-l">{e.losses}</span>
                        <span className="lb-games">{e.gamesPlayed}</span>
                        <span className="lb-wr">
                          <div className="lb-wr-wrap">
                            <div className="lb-wr-fill lb-wr-fill--local"
                              style={{ width: `${e.winRate}%`, background: col }} />
                            <span className="lb-wr-txt">{e.winRate}%</span>
                          </div>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Reset local */}
            <div className="lb-reset-zone">
              <p className="lb-reset-info">
                Clears all local session scores. This cannot be undone.
              </p>
              <button
                className={`lb-reset-btn ${confirmReset ? "lb-reset-btn--confirm" : ""}`}
                onClick={handleLocalReset}
                disabled={localLeaderboard.length === 0}
              >
                {confirmReset ? "⚠ Tap again to confirm reset" : "🗑 Reset Local Leaderboard"}
              </button>
              {confirmReset && (
                <button className="lb-cancel-btn" onClick={() => setConfirmReset(false)}>Cancel</button>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
