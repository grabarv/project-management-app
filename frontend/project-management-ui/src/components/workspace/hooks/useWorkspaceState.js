import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchProjects } from "../../../services/projectApi";

/**
 * Owns shared workspace state, derived values, and top-level workspace actions.
 */
export function useWorkspaceState(currentUser, showError) {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [activePanel, setActivePanel] = useState("details");
  const [isLoading, setIsLoading] = useState(true);

  const loadProjects = useCallback(async ({ silent = false } = {}) => {
    if (!currentUser?.userId) {
      setProjects([]);
      setIsLoading(false);
      return false;
    }

    if (!silent) {
      setIsLoading(true);
    }

    const result = await fetchProjects(currentUser.userId);
    if (!result.ok) {
      setProjects([]);
      if (!silent) {
        showError(result.message || "Failed to load projects");
      }
      setIsLoading(false);
      return false;
    }

    setProjects(result.data);
    if (!silent) {
      setIsLoading(false);
    }
    return true;
  }, [currentUser, showError]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    if (!currentUser?.userId) {
      return undefined;
    }

    // Poll workspace data so invitations/participants update without a manual reload.
    const intervalId = window.setInterval(() => {
      loadProjects({ silent: true });
    }, 5000);

    const handleWindowFocus = () => {
      loadProjects({ silent: true });
    };

    window.addEventListener("focus", handleWindowFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [currentUser?.userId, loadProjects]);

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

  return {
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
      reloadProjects: loadProjects,
      handleProjectCreated,
      handleProjectDeleted,
      handleProjectUpdated,
    },
  };
}
