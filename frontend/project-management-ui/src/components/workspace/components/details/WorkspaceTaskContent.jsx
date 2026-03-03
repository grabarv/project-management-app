import TaskDetailsDrawer from "../tasks/TaskDetailsDrawer";
import WorkspaceUpdateTaskForm from "../tasks/WorkspaceUpdateTaskForm";
import { useWorkspaceContext } from "../../WorkspaceContext";

/**
 * Selected-task branch of the workspace details panel.
 */
export default function WorkspaceTaskContent({
  selectedTask,
  taskViewMode,
  onTaskUpdated,
  onCloseTaskView,
}) {
  const { selectedProject } = useWorkspaceContext();

  if (!selectedTask) {
    return null;
  }

  if (taskViewMode === "edit") {
    return (
      <WorkspaceUpdateTaskForm
        task={selectedTask}
        onTaskUpdated={onTaskUpdated}
        onCancel={onCloseTaskView}
      />
    );
  }

  return (
    <TaskDetailsDrawer
      task={selectedTask}
      onClose={onCloseTaskView}
      onTaskUpdated={onTaskUpdated}
    />
  );
}
