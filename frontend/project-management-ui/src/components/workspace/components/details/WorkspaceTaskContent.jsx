import TaskDetailsDrawer from "../tasks/TaskDetailsDrawer";
import WorkspaceUpdateTaskForm from "../tasks/WorkspaceUpdateTaskForm";
import { useWorkspaceContext } from "../../WorkspaceContext";
import { useWorkspaceDetailsContext } from "./WorkspaceDetailsContext";

/**
 * Selected-task branch of the workspace details panel.
 */
export default function WorkspaceTaskContent() {
  const { selectedProject } = useWorkspaceContext();
  const { selectedTask, taskViewMode, handleTaskUpdated, closeTaskView } =
    useWorkspaceDetailsContext();

  if (!selectedTask) {
    return null;
  }

  if (taskViewMode === "edit") {
    return (
      <WorkspaceUpdateTaskForm
        task={selectedTask}
        onTaskUpdated={handleTaskUpdated}
        onCancel={closeTaskView}
      />
    );
  }

  return (
    <TaskDetailsDrawer
      task={selectedTask}
      onClose={closeTaskView}
      onTaskUpdated={handleTaskUpdated}
    />
  );
}
