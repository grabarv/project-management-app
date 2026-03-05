import TaskDetailsDrawer from "../tasks/TaskDetailsDrawer/TaskDetailsDrawer";
import WorkspaceUpdateTaskForm from "../tasks/WorkspaceUpdateTaskForm/WorkspaceUpdateTaskForm";
import { useWorkspaceDetailsContext } from "./WorkspaceDetailsContext";

/**
 * Selected-task branch of the workspace details panel.
 */
export default function WorkspaceTaskContent() {
  const { selectedTask, taskViewMode } = useWorkspaceDetailsContext();

  if (!selectedTask) {
    return null;
  }

  if (taskViewMode === "edit") {
    return <WorkspaceUpdateTaskForm />;
  }

  return <TaskDetailsDrawer />;
}
