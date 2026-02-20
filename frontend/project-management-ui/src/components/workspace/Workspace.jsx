import { useCallback, useEffect, useMemo, useState } from "react";
import "./workspace.css";
import { fetchProjects } from "../../services/projectApi";
import WorkspaceSidebar from "./components/WorkspaceSidebar";
import WorkspaceDetails from "./components/WorkspaceDetails";
import WorkspaceCreateProjectForm from "./components/WorkspaceCreateProjectForm";
import WorkspaceUpdateProjectForm from "./components/WorkspaceUpdateProjectForm";
import { useNotification } from "../notification/notificationContext";

/**
 * Workspace container:
 * - loads user-visible projects
 * - coordinates which right-side panel is active
 * - reacts to create/delete completion callbacks from child views
 */
export default function Workspace({ currentUser }) {
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

  const handleStartCreateProject = useCallback(() => {
    setActivePanel("create");
  }, []);

  const handleStartUpdateProject = useCallback(() => {
    if (!selectedProject) {
      return;
    }

    setActivePanel("edit");
  }, [selectedProject]);

  // Opening details panel after selecting a project keeps UI state explicit.
  const handleSelectProject = useCallback((projectId) => {
    setSelectedProjectId(projectId);
    setActivePanel("details");
  }, []);

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

  return (
    <main className="workspace-layout">
      <WorkspaceSidebar
        currentUser={currentUser}
        onStartCreateProject={handleStartCreateProject}
        isLoading={isLoading}
        userProjects={userProjects}
        selectedProjectId={selectedProjectId}
        onSelectProject={handleSelectProject}
      />
      {/* Right side switches between create, edit and details views */}
      {activePanel === "create" ? (
        <WorkspaceCreateProjectForm
          currentUser={currentUser}
          onProjectCreated={handleProjectCreated}
          onCancel={() => setActivePanel("details")}
        />
      ) : activePanel === "edit" && selectedProject ? (
        <WorkspaceUpdateProjectForm
          currentUser={currentUser}
          selectedProject={selectedProject}
          onProjectUpdated={handleProjectUpdated}
          onCancel={() => setActivePanel("details")}
        />
      ) : (
        <WorkspaceDetails
          currentUser={currentUser}
          selectedProject={selectedProject}
          isCreator={isCreator}
          onProjectDeleted={handleProjectDeleted}
          onStartUpdateProject={handleStartUpdateProject}
        />
      )}
    </main>
  );
}
