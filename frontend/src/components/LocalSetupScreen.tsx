import { useState } from "react";
import { useStore } from "../store";
import { SYMBOLS, SYMBOL_COLOR, SYMBOL_BG, SYMBOL_LABEL, LocalPlayer } from "../types";
import "./LocalSetupScreen.css";

export default function LocalSetupScreen() {
  const { setScreen, setLocalPlayers, localReset, setNotification } = useStore();
  const [count, setCount] = useState<2 | 3 | 4>(2);
  const [names, setNames] = useState(["", "", "", ""]);

  const updateName = (i: number, val: string) => {
    const n = [...names]; n[i] = val; setNames(n);
  };

  const start = () => {
    const active = names.slice(0, count);
    for (let i = 0; i < active.length; i++) {
      if (!active[i].trim()) {
        setNotification({ message: `Enter a name for Player ${i + 1}.`, type: "error" });
        return;
      }
    }

    const players: LocalPlayer[] = active.map((name, i) => ({
      id: crypto.randomUUID(),
      name: name.trim(),
      symbol: SYMBOLS[i],
    }));

    setLocalPlayers(players);
    localReset();
    setScreen("local-game");
  };

  return (
    <div className="lsetup">
      <div className="lsetup-bg" />

      <div className="lsetup-wrap">
        <button className="lsetup-back" onClick={() => setScreen("home")}>← Back</button>

        <div className="lsetup-header">
          <div className="lsetup-mode-badge">🖥️ Local Multiplayer</div>
          <h2 className="lsetup-title">Set Up Your Game</h2>
          <p className="lsetup-sub">Enter player names, then pass the device on each turn.</p>
        </div>

        {/* Player count selector */}
        <div className="lsetup-section">
          <p className="lsetup-section-label">Number of Players</p>
          <div className="lsetup-count-row">
            {([2, 3, 4] as const).map(n => (
              <button
                key={n}
                className={`lsetup-count-btn ${count === n ? "lsetup-count-btn--on" : ""}`}
                onClick={() => setCount(n)}
              >
                {n} Players
              </button>
            ))}
          </div>
        </div>

        {/* Player name inputs */}
        <div className="lsetup-section">
          <p className="lsetup-section-label">Player Names</p>
          <div className="lsetup-players">
            {SYMBOLS.slice(0, count).map((sym, i) => {
              const col = SYMBOL_COLOR[sym];
              const bg = SYMBOL_BG[sym];
              return (
                <div key={sym} className="lsetup-player" style={{ "--c": col, "--bg": bg } as React.CSSProperties}>
                  <div className="lsetup-sym">{sym}</div>
                  <div className="lsetup-player-right">
                    <span className="lsetup-player-label">{SYMBOL_LABEL[sym]}</span>
                    <input
                      className="lsetup-name-input"
                      type="text"
                      placeholder={`Player ${i + 1} name…`}
                      value={names[i]}
                      maxLength={20}
                      onChange={e => updateName(i, e.target.value)}
                      onKeyDown={e => e.key === "Enter" && start()}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button className="lsetup-start-btn" onClick={start}>
          ▶  Start Local Game
        </button>

        <div className="lsetup-rules">
          <p className="lsetup-rules-title">Rules</p>
          <ul className="lsetup-rules-list">
            <li>Players take turns in order on the same screen</li>
            <li>Get <strong>5 in a row</strong> to win (any direction)</li>
            <li>Scroll to zoom · drag to pan the infinite board</li>
            <li>Local scores are tracked for this session only</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
