import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchProjects } from "../../services/projectApi";
import { useNotification } from "../notification/notificationContext";

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children, currentUser }) {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [activePanel, setActivePanel] = useState("details");
  const [isLoading, setIsLoading] = useState(true);
  const { showError } = useNotification();

  const loadProjects = useCallback(async () => {
    if (!currentUser?.userId) {
      setProjects([]);
      setIsLoading(false);
      return false;
    }

    setIsLoading(true);

    const result = await fetchProjects(currentUser.userId);
    if (!result.ok) {
      setProjects([]);
      showError(result.message || "Failed to load projects");
      setIsLoading(false);
      return false;
    }

    setProjects(result.data);
    setIsLoading(false);
    return true;
  }, [currentUser, showError]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProjects();
  }, [loadProjects]);

  const userProjects = useMemo(() => {
    if (!currentUser?.userId) {
      return [];
    }

    return projects.filter(
      (project) =>
        project.createdByUserId === currentUser.userId ||
        project.participatingUserIds?.includes(currentUser.userId)
    );
  }, [projects, currentUser]);

  const selectedProject = useMemo(
    () => userProjects.find((project) => project.id === selectedProjectId) ?? null,
    [userProjects, selectedProjectId]
  );

  const isCreator = selectedProject?.createdByUserId === currentUser?.userId;

  const startCreateProject = useCallback(() => {
    setActivePanel("create");
  }, []);

  const startUpdateProject = useCallback(() => {
    if (!selectedProject || !isCreator) {
      return;
    }

    setActivePanel("edit");
  }, [isCreator, selectedProject]);

  const selectProject = useCallback((projectId) => {
    setSelectedProjectId(projectId);
    setActivePanel("details");
  }, []);

  const cancelPanel = useCallback(() => {
    setActivePanel("details");
  }, []);

  const handleProjectCreated = useCallback(
    async (projectId) => {
      await loadProjects();
      if (projectId) {
        setSelectedProjectId(projectId);
      }
      setActivePanel("details");
    },
    [loadProjects]
  );

  const handleProjectDeleted = useCallback(async () => {
    setSelectedProjectId(null);
    await loadProjects();
  }, [loadProjects]);

  const handleProjectUpdated = useCallback(
    async (projectId) => {
      await loadProjects();
      if (projectId) {
        setSelectedProjectId(projectId);
      }
      setActivePanel("details");
    },
    [loadProjects]
  );

  const value = useMemo(
    () => ({
      currentUser,
      userProjects,
      selectedProject,
      selectedProjectId,
      activePanel,
      isLoading,
      isCreator,
      actions: {
        startCreateProject,
        startUpdateProject,
        selectProject,
        cancelPanel,
        handleProjectCreated,
        handleProjectDeleted,
        handleProjectUpdated,
      },
    }),
    [
      activePanel,
      currentUser,
      handleProjectCreated,
      handleProjectDeleted,
      handleProjectUpdated,
      isCreator,
      isLoading,
      selectedProject,
      selectedProjectId,
      startCreateProject,
      startUpdateProject,
      selectProject,
      cancelPanel,
      userProjects,
    ]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspaceContext() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error("useWorkspaceContext must be used within WorkspaceProvider");
  }

  return context;
}
