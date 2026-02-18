/* eslint-disable react-hooks/set-state-in-effect */
import "./workspace.css";
import { useEffect, useMemo, useState } from "react";
import { createProject, deleteProject, fetchProjects, updateProject } from "../../services/projectApi";

export default function Workspace({ currentUser }) {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionInfo, setActionInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    dueDate: "",
  });

  const loadProjects = async () => {
    setIsLoading(true);
    setErrorMessage("");

    const result = await fetchProjects();
    if (!result.ok) {
      setProjects([]);
      setErrorMessage(result.message);
      setIsLoading(false);
      return false;
    }

    setProjects(result.data);
    setIsLoading(false);
    return true;
  };

  useEffect(() => {
    loadProjects();
  }, []);

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

  const selectedProject = useMemo(() => {
    return userProjects.find((project) => project.id === selectedProjectId) ?? null;
  }, [userProjects, selectedProjectId]);

  useEffect(() => {
    if (selectedProjectId !== null && !selectedProject) {
      setSelectedProjectId(null);
    }
  }, [selectedProjectId, selectedProject]);

  const isCreator =
    selectedProject?.createdByUserId !== undefined &&
    selectedProject.createdByUserId === currentUser?.userId;

  const formatDate = (value) => {
    if (!value) {
      return "N/A";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleDateString();
  };

  const toApiDateTime = (value) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed.toISOString();
  };

  const handleCreateChange = (event) => {
    const { name, value } = event.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();
    if (!currentUser?.userId) {
      setActionError("Missing user information. Please sign in again.");
      return;
    }

    const dueDateUtc = toApiDateTime(createForm.dueDate);
    if (!dueDateUtc) {
      setActionError("Please provide a valid due date.");
      return;
    }

    setIsSubmitting(true);
    setActionError("");
    setActionInfo("");

    const result = await createProject({
      name: createForm.name.trim(),
      description: createForm.description.trim(),
      dueDateUtc,
      createdByUserId: currentUser.userId,
      participatingUserIds: [],
    });

    if (!result.ok) {
      setActionError(result.message);
      setIsSubmitting(false);
      return;
    }

    setCreateForm({ name: "", description: "", dueDate: "" });
    setActionInfo("Project created.");
    await loadProjects();
    if (result.data?.id) {
      setSelectedProjectId(result.data.id);
    }
    setIsSubmitting(false);
  };

  const handleDeleteSelectedProject = async () => {
    if (!selectedProject || !isCreator) {
      return;
    }

    setIsSubmitting(true);
    setActionError("");
    setActionInfo("");

    const result = await deleteProject(selectedProject.id);
    if (!result.ok) {
      setActionError(result.message);
      setIsSubmitting(false);
      return;
    }

    setActionInfo("Project deleted.");
    setSelectedProjectId(null);
    await loadProjects();
    setIsSubmitting(false);
  };

  const handleLeaveSelectedProject = async () => {
    if (!selectedProject || isCreator || !currentUser?.userId) {
      return;
    }

    const remainingParticipants = (selectedProject.participatingUserIds ?? []).filter(
      (userId) => userId !== currentUser.userId
    );

    setIsSubmitting(true);
    setActionError("");
    setActionInfo("");

    const result = await updateProject(selectedProject.id, {
      name: selectedProject.name,
      description: selectedProject.description,
      dueDateUtc: selectedProject.dueDateUtc,
      participatingUserIds: remainingParticipants,
    });

    if (!result.ok) {
      setActionError(result.message);
      setIsSubmitting(false);
      return;
    }

    setActionInfo("You left the project.");
    setSelectedProjectId(null);
    await loadProjects();
    setIsSubmitting(false);
  };

  return (
    <main className="workspace-layout">
      <section className="workspace-column workspace-sidebar">
        <div className="workspace-header">
          <h2>Projects</h2>
          <p>{currentUser?.username || "User"}</p>
        </div>

        <form className="create-project-form" onSubmit={handleCreateSubmit}>
          <h3>Create project</h3>
          <input
            type="text"
            name="name"
            placeholder="Project name"
            required
            value={createForm.name}
            onChange={handleCreateChange}
          />
          <textarea
            name="description"
            placeholder="Description"
            required
            value={createForm.description}
            onChange={handleCreateChange}
          />
          <input
            type="date"
            name="dueDate"
            required
            value={createForm.dueDate}
            onChange={handleCreateChange}
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Working..." : "Create"}
          </button>
        </form>

        {isLoading && <p className="workspace-info">Loading projects...</p>}
        {!isLoading && errorMessage && <p className="workspace-error">{errorMessage}</p>}
        {!isLoading && actionError && <p className="workspace-error">{actionError}</p>}
        {!isLoading && actionInfo && <p className="workspace-info">{actionInfo}</p>}

        {!isLoading && !errorMessage && userProjects.length === 0 && (
          <p className="workspace-info">No projects assigned yet.</p>
        )}

        {!isLoading && !errorMessage && userProjects.length > 0 && (
          <ul className="project-list">
            {userProjects.map((project) => (
              <li key={project.id}>
                <button
                  type="button"
                  className={`project-item ${selectedProjectId === project.id ? "selected" : ""}`}
                  onClick={() => setSelectedProjectId(project.id)}
                >
                  {project.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="workspace-column workspace-details">
        {selectedProject ? (
          <article>
            <h2>{selectedProject.name}</h2>
            <p className="project-description">{selectedProject.description}</p>
            <p>
              <strong>Created:</strong> {formatDate(selectedProject.createdAtUtc)}
            </p>
            <p>
              <strong>Due:</strong> {formatDate(selectedProject.dueDateUtc)}
            </p>
            <div className="project-actions">
              {isCreator ? (
                <button
                  type="button"
                  className="danger"
                  disabled={isSubmitting}
                  onClick={handleDeleteSelectedProject}
                >
                  Delete project
                </button>
              ) : (
                <button
                  type="button"
                  className="neutral"
                  disabled={isSubmitting}
                  onClick={handleLeaveSelectedProject}
                >
                  Leave project
                </button>
              )}
            </div>
          </article>
        ) : (
          <div className="workspace-empty-state">
            <h2>Select a project</h2>
            <p>Choose a project name from the left side to view details here.</p>
          </div>
        )}
      </section>
    </main>
  );
}
