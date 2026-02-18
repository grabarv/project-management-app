import "./workspace.css";
import { useEffect, useMemo, useState } from "react";
import { fetchProjects } from "../../services/projectApi";

export default function Workspace({ currentUser }) {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true);
      setErrorMessage("");

      const result = await fetchProjects();
      if (!result.ok) {
        setProjects([]);
        setErrorMessage(result.message);
        setIsLoading(false);
        return;
      }

      setProjects(result.data);
      setIsLoading(false);
    };

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

  return (
    <main className="workspace-layout">
      <section className="workspace-column workspace-sidebar">
        <div className="workspace-header">
          <h2>Projects</h2>
          <p>{currentUser?.username || "User"}</p>
        </div>

        {isLoading && <p className="workspace-info">Loading projects...</p>}
        {!isLoading && errorMessage && <p className="workspace-error">{errorMessage}</p>}

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
