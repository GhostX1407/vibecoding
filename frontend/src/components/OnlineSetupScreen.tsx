import { useState } from "react";
import { socket } from "../socket";
import { useStore } from "../store";
import "./OnlineSetupScreen.css";

export default function OnlineSetupScreen() {
  const { playerName, setPlayerName, playerId, setNotification, setScreen } = useStore();
  const [name, setName] = useState(playerName);
  const [code, setCode] = useState("");
  const [tab, setTab] = useState<"create" | "join">("create");

  const create = () => {
    const n = name.trim();
    if (!n) { setNotification({ message: "Enter your name to continue.", type: "error" }); return; }
    setPlayerName(n);
    socket.emit("create_room", { playerName: n });
  };

  const join = () => {
    const n = name.trim();
    const c = code.trim().toUpperCase();
    if (!n) { setNotification({ message: "Enter your name to continue.", type: "error" }); return; }
    if (c.length < 4) { setNotification({ message: "Enter a valid room code.", type: "error" }); return; }
    setPlayerName(n);
    socket.emit("join_room", { code: c, playerName: n, playerId });
  };

  return (
    <div className="osetup">
      <div className="osetup-bg" />

      <div className="osetup-wrap">
        <button className="osetup-back" onClick={() => setScreen("home")}>← Back</button>

        <div className="osetup-header">
          <div className="osetup-mode-badge">🌐 Online Multiplayer</div>
          <h2 className="osetup-title">Join or Create a Room</h2>
          <p className="osetup-sub">Each browser tab is a separate player. Share the room code to invite friends.</p>
        </div>

        <div className="osetup-card">
          <div className="osf-field">
            <label className="osf-label">Your Name</label>
            <input
              className="osf-input"
              type="text"
              placeholder="What should we call you?"
              value={name}
              maxLength={20}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && (tab === "create" ? create() : join())}
            />
          </div>

          <div className="osf-tabs">
            <button className={`osf-tab ${tab === "create" ? "osf-tab--on" : ""}`} onClick={() => setTab("create")}>
              Create Room
            </button>
            <button className={`osf-tab ${tab === "join" ? "osf-tab--on" : ""}`} onClick={() => setTab("join")}>
              Join Room
            </button>
          </div>

          {tab === "create" ? (
            <div className="osf-panel" key="c">
              <p className="osf-hint">Create a private room and invite up to 3 friends with a 5-letter code.</p>
              <button className="osf-btn osf-btn--create" onClick={create}>Create Room →</button>
            </div>
          ) : (
            <div className="osf-panel" key="j">
              <div className="osf-field">
                <label className="osf-label">Room Code</label>
                <input
                  className="osf-input osf-input--code"
                  type="text" placeholder="XXXXX"
                  value={code} maxLength={5}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === "Enter" && join()}
                />
              </div>
              <button className="osf-btn osf-btn--join" onClick={join}>Join Game →</button>
            </div>
          )}
        </div>

        <p className="osetup-tip">
          💡 Open a new tab in the same browser to play as a different player
        </p>
      </div>
    </div>
  );
}
