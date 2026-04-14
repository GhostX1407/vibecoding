import { useSocket } from "./hooks/useSocket";
import { useStore } from "./store";
import HomeScreen          from "./components/HomeScreen";
import OnlineSetupScreen   from "./components/OnlineSetupScreen";
import LocalSetupScreen    from "./components/LocalSetupScreen";
import LobbyScreen         from "./components/LobbyScreen";
import GameScreen          from "./components/GameScreen";
import LocalGameScreen     from "./components/LocalGameScreen";
import GameOverScreen      from "./components/GameOverScreen";
import LocalGameOverScreen from "./components/LocalGameOverScreen";
import LeaderboardScreen   from "./components/LeaderboardScreen";
import Notification        from "./components/Notification";
import "./App.css";

export default function App() {
  useSocket();
  const { screen } = useStore();
  return (
    <div className="app">
      {screen === "home"           && <HomeScreen />}
      {screen === "mode-select"    && <OnlineSetupScreen />}
      {screen === "local-setup"    && <LocalSetupScreen />}
      {screen === "lobby"          && <LobbyScreen />}
      {screen === "game"           && <GameScreen />}
      {screen === "local-game"     && <LocalGameScreen />}
      {screen === "gameover"       && <GameOverScreen />}
      {screen === "local-gameover" && <LocalGameOverScreen />}
      {screen === "leaderboard"    && <LeaderboardScreen />}
      <Notification />
    </div>
  );
}
