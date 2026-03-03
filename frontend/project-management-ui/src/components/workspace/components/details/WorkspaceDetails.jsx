import { useWorkspaceDetailsState } from "../../hooks/useWorkspaceDetailsState";
import { useWorkspaceContext } from "../../WorkspaceContext";
import WorkspaceProjectContent from "./WorkspaceProjectContent";
import WorkspaceTaskContent from "./WorkspaceTaskContent";

/**
 * Right-side project details view with creator-only delete action.
 */
export default function WorkspaceDetails() {
  const { selectedProject } = useWorkspaceContext();
  const {
    selectedTask,
    taskViewMode,
    tasksRefreshKey,
    isCreateTaskOpen,
    openTaskDetails,
    openTaskEdit,
    closeTaskView,
    handleTaskUpdated,
    handleTaskCreated,
    handleTaskDeleted,
    toggleCreateTask,
    closeCreateTask,
  } = useWorkspaceDetailsState(selectedProject);

  const taskControls = {
    tasksRefreshKey,
    isCreateTaskOpen,
    openTaskDetails,
    openTaskEdit,
    handleTaskUpdated,
    handleTaskCreated,
    handleTaskDeleted,
    toggleCreateTask,
    closeCreateTask,
  };

  return (
    <section className="workspace-column workspace-details">
      {!selectedProject ? (
        <div className="workspace-empty-state">
          <h2>Select a project</h2>
          <p>Choose a project name from the left side to view details here.</p>
        </div>
      ) : selectedTask ? (
        <WorkspaceTaskContent
          selectedTask={selectedTask}
          taskViewMode={taskViewMode}
          onTaskUpdated={handleTaskUpdated}
          onCloseTaskView={closeTaskView}
        />
      ) : (
        <WorkspaceProjectContent
          taskControls={taskControls}
        />
      )}
    </section>
  );
}
