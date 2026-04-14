import express from "express";
import cors from "cors";
import { getLeaderboard, resetLeaderboard } from "./modules/ranking/ranking.service";

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

app.get("/leaderboard", (_req, res) => {
  res.json(getLeaderboard());
});

/** Reset global leaderboard — wipes all ELO ratings and stats in memory */
app.post("/leaderboard/reset", (_req, res) => {
  resetLeaderboard();
  res.json({ success: true, message: "Global leaderboard has been reset." });
});

export default app;
