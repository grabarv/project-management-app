import { useCallback, useEffect, useMemo, useState } from "react";
import "./workspace.css";
import {
  createProject,
  deleteProject,
  fetchProjects,
} from "../../services/projectApi";
import { EMPTY_CREATE_FORM } from "./constants";
import { toApiDateTime } from "./utils";
import WorkspaceSidebar from "./components/WorkspaceSidebar";
import WorkspaceDetails from "./components/WorkspaceDetails";
import WorkspaceCreateProjectForm from "./components/WorkspaceCreateProjectForm";
import { useNotification } from "../notification/notificationContext";

export default function Workspace({ currentUser }) {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [activePanel, setActivePanel] = useState("details");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const { showError, showSuccess } = useNotification();

  const todayDateString = useMemo(() => new Date().toISOString().slice(0, 10), []);

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

  const handleCreateChange = useCallback((event) => {
    const { name, value } = event.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleCreateSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (!currentUser?.userId) {
        showError("Missing user information. Please sign in again.");
        return;
      }

      const dueDateUtc = toApiDateTime(createForm.dueDate);
      if (!dueDateUtc) {
        showError("Please provide a valid due date.");
        return;
      }
      if (createForm.dueDate < todayDateString) {
        showError("Due date cannot be earlier than creation date.");
        return;
      }

      setIsSubmitting(true);

      const result = await createProject({
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        dueDateUtc,
        createdByUserId: currentUser.userId,
        participatingUserIds: [],
      });

      if (!result.ok) {
        showError(result.message || "Failed to create project");
        setIsSubmitting(false);
        return;
      }

      setCreateForm(EMPTY_CREATE_FORM);
      showSuccess("Project created.");
      await loadProjects();

      if (result.data?.id) {
        setSelectedProjectId(result.data.id);
      }
      setActivePanel("details");
      setIsSubmitting(false);
    },
    [createForm, currentUser, loadProjects, showError, showSuccess, todayDateString]
  );

  const handleDeleteSelectedProject = useCallback(async () => {
    if (!selectedProject || !isCreator) {
      return;
    }

    setIsSubmitting(true);

    const result = await deleteProject(selectedProject.id);
    if (!result.ok) {
      showError(result.message || "Failed to delete project");
      setIsSubmitting(false);
      return;
    }

    showSuccess("Project deleted.");
    setSelectedProjectId(null);
    await loadProjects();
    setIsSubmitting(false);
  }, [isCreator, loadProjects, selectedProject, showError, showSuccess]);

  const handleStartCreateProject = useCallback(() => {
    setActivePanel("create");
  }, []);

  const handleSelectProject = useCallback((projectId) => {
    setSelectedProjectId(projectId);
    setActivePanel("details");
  }, []);

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
          createForm={createForm}
          onCreateChange={handleCreateChange}
          onCreateSubmit={handleCreateSubmit}
          onCancel={() => setActivePanel("details")}
          isSubmitting={isSubmitting}
          todayDateString={todayDateString}
        />
      ) : (
        <WorkspaceDetails
          selectedProject={selectedProject}
          isCreator={isCreator}
          isSubmitting={isSubmitting}
          onDeleteSelectedProject={handleDeleteSelectedProject}
        />
      )}
    </main>
  );
}
