import { io } from "socket.io-client";
const URL = (import.meta as any).env?.VITE_BACKEND_URL || "http://localhost:3001";
export const socket = io(URL, { autoConnect: true, reconnectionAttempts: 5 });
