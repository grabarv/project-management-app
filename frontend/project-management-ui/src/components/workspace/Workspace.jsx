import { useCallback, useEffect, useMemo, useState } from "react";
import "./workspace.css";
import { fetchProjects } from "../../services/projectApi";
import WorkspaceSidebar from "./components/WorkspaceSidebar";
import WorkspaceDetails from "./components/WorkspaceDetails";
import WorkspaceCreateProjectForm from "./components/WorkspaceCreateProjectForm";
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
    setIsLoading(true);

    const result = await fetchProjects();
    if (!result.ok) {
      setProjects([]);
      showError(result.message || "Failed to load projects");
      setIsLoading(false);
      return false;
    }

    setProjects(result.data);
    setIsLoading(false);
    return true;
  }, [showError]);

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

  // Opening details panel after selecting a project keeps UI state explicit.
  const handleSelectProject = useCallback((projectId) => {
    setSelectedProjectId(projectId);
    setActivePanel("details");
  }, []);

  const handleProjectDeleted = useCallback(async () => {
    setSelectedProjectId(null);
    await loadProjects();
  }, [loadProjects]);

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
      {/* Right side switches between create form and project details */}
      {activePanel === "create" ? (
        <WorkspaceCreateProjectForm
          currentUser={currentUser}
          onProjectCreated={handleProjectCreated}
          onCancel={() => setActivePanel("details")}
        />
      ) : (
        <WorkspaceDetails
          selectedProject={selectedProject}
          isCreator={isCreator}
          onProjectDeleted={handleProjectDeleted}
        />
      )}
    </main>
  );
}
