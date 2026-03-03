import { createContext, useContext } from "react";
import { useWorkspaceDetailsState } from "../../hooks/useWorkspaceDetailsState";

const WorkspaceDetailsContext = createContext(null);

/**
 * Provides right-panel task/detail state for the selected project subtree.
 */
export function WorkspaceDetailsProvider({ children, selectedProject }) {
  const value = useWorkspaceDetailsState(selectedProject);

  return (
    <WorkspaceDetailsContext.Provider value={value}>{children}</WorkspaceDetailsContext.Provider>
  );
}

export function useWorkspaceDetailsContext() {
  const context = useContext(WorkspaceDetailsContext);

  if (!context) {
    throw new Error("useWorkspaceDetailsContext must be used within WorkspaceDetailsProvider");
  }

  return context;
}
