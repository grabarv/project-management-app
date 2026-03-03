import ProjectTasksTable from "../tasks/ProjectTasksTable";
import WorkspaceCreateTaskForm from "../tasks/WorkspaceCreateTaskForm";
import { useWorkspaceContext } from "../../WorkspaceContext";
import { useWorkspaceDetailsContext } from "./WorkspaceDetailsContext";

/**
 * Renders the task-management area for the selected project.
 */
export default function ProjectTasksSection() {
  const { isCreator } = useWorkspaceContext();
  const {
    isCreateTaskOpen,
    handleTaskCreated,
    closeCreateTask,
    openTaskDetails,
    openTaskEdit,
    handleTaskDeleted,
    tasksRefreshKey,
  } = useWorkspaceDetailsContext();

  return (
    <>
      {isCreator && isCreateTaskOpen && (
        <WorkspaceCreateTaskForm onTaskCreated={handleTaskCreated} onCancel={closeCreateTask} />
      )}
      <ProjectTasksTable
        onTaskSelect={openTaskDetails}
        onTaskEdit={openTaskEdit}
        onTaskDeleted={handleTaskDeleted}
        refreshKey={tasksRefreshKey}
      />
    </>
  );
}
