import { useEffect } from "react";
import "./notification.css";

export default function Notification({ type, message, onClose, duration = 3500 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`notification notification-${type}`} role="status" aria-live="polite">
      {message}
    </div>
  );
}
