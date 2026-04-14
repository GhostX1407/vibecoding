import { useStore } from "../store";
import "./HomeScreen.css";

export default function HomeScreen() {
  const { setScreen, setGameMode } = useStore();

  const chooseLocal = () => {
    setGameMode("local");
    setScreen("local-setup");
  };

  const chooseOnline = () => {
    setGameMode("online");
    setScreen("mode-select");
  };

  return (
    <div className="home">
      <div className="home-texture" />

      <div className="home-inner">
        {/* Branding */}
        <div className="home-brand">
          <div className="home-symbols">
            {(["X", "O", "△", "◇"] as const).map((s, i) => (
              <div key={s} className={`home-sym home-sym--${i + 1}`}>{s}</div>
            ))}
          </div>
          <h1 className="home-heading">
            <span className="home-heading-inf">Infinite</span>
            <span className="home-heading-ttt">Tic‑Tac‑Toe</span>
          </h1>
          <p className="home-tagline">
            An infinite canvas. Four players.<br />One winner. No limits.
          </p>
        </div>

        {/* Mode cards */}
        <div className="home-modes">
          <button className="mode-card mode-card--local" onClick={chooseLocal}>
            <div className="mode-card-icon">🖥️</div>
            <div className="mode-card-body">
              <span className="mode-card-title">Local Multiplayer</span>
              <span className="mode-card-desc">
                2–4 players on the same device.<br />
                Take turns passing the screen.
              </span>
            </div>
            <span className="mode-card-arrow">→</span>
          </button>

          <button className="mode-card mode-card--online" onClick={chooseOnline}>
            <div className="mode-card-icon">🌐</div>
            <div className="mode-card-body">
              <span className="mode-card-title">Online Multiplayer</span>
              <span className="mode-card-desc">
                Each browser tab is a new player.<br />
                Share a room code to invite friends.
              </span>
            </div>
            <span className="mode-card-arrow">→</span>
          </button>

          <button className="mode-card mode-card--lb" onClick={() => setScreen("leaderboard")}>
            <div className="mode-card-icon">🏆</div>
            <div className="mode-card-body">
              <span className="mode-card-title">Leaderboard</span>
              <span className="mode-card-desc">
                View global online rankings<br />and local session scores.
              </span>
            </div>
            <span className="mode-card-arrow">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
