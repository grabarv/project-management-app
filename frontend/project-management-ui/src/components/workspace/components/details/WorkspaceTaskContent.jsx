import TaskDetailsDrawer from "../tasks/TaskDetailsDrawer";
import WorkspaceUpdateTaskForm from "../tasks/WorkspaceUpdateTaskForm";

/**
 * Selected-task branch of the workspace details panel.
 */
export default function WorkspaceTaskContent({
  currentUser,
  selectedProject,
  selectedTask,
  taskViewMode,
  onTaskUpdated,
  onCloseTaskView,
}) {
  if (!selectedTask) {
    return null;
  }

  if (taskViewMode === "edit") {
    return (
      <WorkspaceUpdateTaskForm
        currentUser={currentUser}
        selectedProject={selectedProject}
        task={selectedTask}
        onTaskUpdated={onTaskUpdated}
        onCancel={onCloseTaskView}
      />
    );
  }

  return (
    <TaskDetailsDrawer
      task={selectedTask}
      currentUser={currentUser}
      onClose={onCloseTaskView}
      onTaskUpdated={onTaskUpdated}
    />
  );
}
