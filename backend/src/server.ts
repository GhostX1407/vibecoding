import http from "http";
import app from "./app";
import { setupSocket } from "./modules/realtime/realtime.gateway";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const server = http.createServer(app);
setupSocket(server);
server.listen(PORT, () => {
  console.log(`\n🎮 Infinite Tic-Tac-Toe v2 — port ${PORT}`);
  console.log(`   http://localhost:${PORT}\n`);
});
