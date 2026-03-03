import { formatDate } from "../../shared/utils";
import { useWorkspaceContext } from "../../WorkspaceContext";
import { useWorkspaceDetailsContext } from "./WorkspaceDetailsContext";

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
    <>
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
    </>
  );
}
