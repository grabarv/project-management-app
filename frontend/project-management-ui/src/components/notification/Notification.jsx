import { useEffect } from "react";
import "./notification.css";

/**
 * Auto-dismiss notification used by auth screens for short status updates.
 */
export default function Notification({ type, message, onClose, duration = 3500 }) {
  useEffect(() => {
    // Reset timer whenever message/duration changes.
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
