import { useCallback, useMemo, useState } from "react";
import Notification from "./Notification";
import { NotificationContext } from "./notificationContext";

/**
 * Centralized notification state for app-wide success/error messages.
 */
export default function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((type, message) => {
    setNotification({ type, message });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const contextValue = useMemo(
    () => ({
      showSuccess: (message) => showNotification("success", message),
      showError: (message) => showNotification("error", message),
      clearNotification: hideNotification,
    }),
    [hideNotification, showNotification]
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={hideNotification}
        />
      )}
    </NotificationContext.Provider>
  );
}
