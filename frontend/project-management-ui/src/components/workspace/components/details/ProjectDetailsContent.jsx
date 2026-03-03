import { formatDate } from "../../shared/utils";
import ProjectTasksTable from "../tasks/ProjectTasksTable";
import WorkspaceCreateTaskForm from "../tasks/WorkspaceCreateTaskForm";

/**
 * Project details view shown when no task subview is active.
 */
export default function ProjectDetailsContent({
  currentUser,
  selectedProject,
  isCreator,
  isCreateTaskOpen,
  onStartUpdateProject,
  onToggleCreateTask,
  onOpenProjectDelete,
  onTaskCreated,
  onCancelCreateTask,
  onTaskSelect,
  onTaskEdit,
  onTaskDeleted,
  tasksRefreshKey,
}) {
  return (
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
          <>
            <button type="button" className="neutral" onClick={onStartUpdateProject}>
              Update project
            </button>
            <button type="button" className="neutral" onClick={onToggleCreateTask}>
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
      {isCreator && isCreateTaskOpen && (
        <WorkspaceCreateTaskForm
          onTaskCreated={onTaskCreated}
          onCancel={onCancelCreateTask}
        />
      )}
      <ProjectTasksTable
        onTaskSelect={onTaskSelect}
        onTaskEdit={onTaskEdit}
        onTaskDeleted={onTaskDeleted}
        refreshKey={tasksRefreshKey}
      />
    </article>
  );
}
