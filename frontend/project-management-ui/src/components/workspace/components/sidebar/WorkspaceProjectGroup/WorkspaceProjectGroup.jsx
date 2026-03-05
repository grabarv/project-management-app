import "./WorkspaceProjectGroup.css";

/**
 * Reusable project group section used in the workspace sidebar.
 */
export default function WorkspaceProjectGroup({
  title,
  projects,
  itemClassName,
  badgeLabel,
  selectedProjectId,
  onSelectProject,
}) {
  if (!projects.length) {
    return null;
  }

  return (
    <section className="project-group" aria-label={title}>
      <div className="project-group-header">
        <h3>{title}</h3>
        <span>{projects.length}</span>
      </div>
      <ul className="project-list">
        {projects.map((project) => (
          <li key={project.id}>
            <button
              type="button"
              className={`project-item ${itemClassName} ${selectedProjectId === project.id ? "selected" : ""}`}
              onClick={() => onSelectProject(project.id)}
            >
              <span className="project-item-name">{project.name}</span>
              <span className="project-item-badge">{badgeLabel}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
