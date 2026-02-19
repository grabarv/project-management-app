export default function WorkspaceSidebar({
  currentUser,
  onStartCreateProject,
  isLoading,
  userProjects,
  selectedProjectId,
  onSelectProject,
}) {
  return (
    <section className="workspace-column workspace-sidebar">
      <div className="workspace-header">
        <h2>Projects</h2>
        <p>{currentUser?.username || "User"}</p>
      </div>

      <button type="button" className="new-project-button" onClick={onStartCreateProject}>
        + New project
      </button>

      {isLoading && <p className="workspace-info">Loading projects...</p>}
      {!isLoading && userProjects.length === 0 && (
        <p className="workspace-info">No projects assigned yet.</p>
      )}

      {!isLoading && userProjects.length > 0 && (
        <ul className="project-list">
          {userProjects.map((project) => (
            <li key={project.id}>
              <button
                type="button"
                className={`project-item ${
                  selectedProjectId === project.id ? "selected" : ""
                }`}
                onClick={() => onSelectProject(project.id)}
              >
                {project.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
