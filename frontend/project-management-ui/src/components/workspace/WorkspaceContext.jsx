import { createContext, useContext, useMemo } from "react";
import { useWorkspaceState } from "./hooks/useWorkspaceState";
import { useNotification } from "../notification/notificationContext";

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children, currentUser }) {
  const { showError } = useNotification();
  const workspaceState = useWorkspaceState(currentUser, showError);

  const value = useMemo(
    () => ({
      currentUser,
      ...workspaceState,
    }),
    [currentUser, workspaceState]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWorkspaceContext() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error("useWorkspaceContext must be used within WorkspaceProvider");
  }

  return context;
}
