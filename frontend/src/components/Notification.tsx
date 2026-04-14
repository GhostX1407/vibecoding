import { useStore } from "../store";
import "./Notification.css";

export default function Notification() {
  const { notification } = useStore();
  if (!notification) return null;
  const icons = { error: "✕", success: "✓", info: "ℹ" };
  return (
    <div className={`toast toast--${notification.type}`}>
      <span className="toast-icon">{icons[notification.type]}</span>
      <span className="toast-msg">{notification.message}</span>
    </div>
  );
}
