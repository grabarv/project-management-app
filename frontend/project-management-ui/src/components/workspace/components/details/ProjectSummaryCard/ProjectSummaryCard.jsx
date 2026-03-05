import { formatDate } from "../../../shared/utils";
import { useWorkspaceContext } from "../../../WorkspaceContext";
import { useWorkspaceDetailsContext } from "../WorkspaceDetailsContext";
import "./ProjectSummaryCard.css";

/**
 * Displays selected project information and top-level project actions.
 */
export default function ProjectSummaryCard({ onOpenProjectDelete }) {
  const {
    selectedProject,
    isCreator,
    actions: { startUpdateProject },
  } = useWorkspaceContext();
  const { isCreateTaskOpen, toggleCreateTask } = useWorkspaceDetailsContext();

  return (
    <article className="project-summary-card">
      <h2>{selectedProject.name}</h2>
      <p className="project-summary-description">{selectedProject.description}</p>
      <p className="project-summary-meta">
        <strong>Created:</strong> {formatDate(selectedProject.createdAtUtc)}
      </p>
      <p className="project-summary-meta">
        <strong>Due:</strong> {formatDate(selectedProject.dueDateUtc)}
      </p>
      <div className="project-summary-actions">
        {isCreator ? (
          <>
            <button type="button" className="neutral" onClick={startUpdateProject}>
              Update project
            </button>
            <button type="button" className="neutral" onClick={toggleCreateTask}>
              {isCreateTaskOpen ? "Close task form" : "Create task"}
            </button>
            <button type="button" className="danger" onClick={onOpenProjectDelete}>
              Delete project
            </button>
          </>
        ) : (
          <p className="workspace-info">
            You are a participant in this project and cannot update it.
          </p>
        )}
      </div>
    </article>
  );
}
