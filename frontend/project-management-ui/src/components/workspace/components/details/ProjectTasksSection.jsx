import ProjectTasksTable from "../tasks/ProjectTasksTable";
import WorkspaceCreateTaskForm from "../tasks/WorkspaceCreateTaskForm";
import { useWorkspaceContext } from "../../WorkspaceContext";

/**
 * Renders the task-management area for the selected project.
 */
export default function ProjectTasksSection({
  isCreateTaskOpen,
  onTaskCreated,
  onCancelCreateTask,
  onTaskSelect,
  onTaskEdit,
  onTaskDeleted,
  tasksRefreshKey,
}) {
  const { isCreator } = useWorkspaceContext();

  return (
    <>
      {isCreator && isCreateTaskOpen && (
        <WorkspaceCreateTaskForm onTaskCreated={onTaskCreated} onCancel={onCancelCreateTask} />
      )}
      <ProjectTasksTable
        onTaskSelect={onTaskSelect}
        onTaskEdit={onTaskEdit}
        onTaskDeleted={onTaskDeleted}
        refreshKey={tasksRefreshKey}
      />
    </>
  );
}
