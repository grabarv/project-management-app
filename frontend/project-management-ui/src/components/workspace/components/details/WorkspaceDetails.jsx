import { useState } from "react";
import ProjectDeleteConfirmModal from "../projects/ProjectDeleteConfirmModal";
import TaskDetailsDrawer from "../tasks/TaskDetailsDrawer";
import WorkspaceUpdateTaskForm from "../tasks/WorkspaceUpdateTaskForm";
import ProjectDetailsContent from "./ProjectDetailsContent";
import { useWorkspaceDetailsState } from "../../hooks/useWorkspaceDetailsState";

/**
 * Right-side project details view with creator-only delete action.
 */
export default function WorkspaceDetails({
  currentUser,
  selectedProject,
  isCreator,
  onProjectDeleted,
  onStartUpdateProject,
}) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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

  return (
    <section className="workspace-column workspace-details">
      {selectedProject ? (
        selectedTask ? (
          taskViewMode === "edit" ? (
            <WorkspaceUpdateTaskForm
              currentUser={currentUser}
              selectedProject={selectedProject}
              task={selectedTask}
              onTaskUpdated={handleTaskUpdated}
              onCancel={closeTaskView}
            />
          ) : (
            <TaskDetailsDrawer
              task={selectedTask}
              currentUser={currentUser}
              onClose={closeTaskView}
              onTaskUpdated={handleTaskUpdated}
            />
          )
        ) : (
          <ProjectDetailsContent
            currentUser={currentUser}
            selectedProject={selectedProject}
            isCreator={isCreator}
            isCreateTaskOpen={isCreateTaskOpen}
            onStartUpdateProject={onStartUpdateProject}
            onToggleCreateTask={toggleCreateTask}
            onOpenProjectDelete={() => setIsDeleteModalOpen(true)}
            onTaskCreated={handleTaskCreated}
            onCancelCreateTask={closeCreateTask}
            onTaskSelect={openTaskDetails}
            onTaskEdit={openTaskEdit}
            onTaskDeleted={handleTaskDeleted}
            tasksRefreshKey={tasksRefreshKey}
          />
        )
      ) : (
        <div className="workspace-empty-state">
          <h2>Select a project</h2>
          <p>Choose a project name from the left side to view details here.</p>
        </div>
      )}
      {isDeleteModalOpen && selectedProject && (
        <ProjectDeleteConfirmModal
          projectId={selectedProject.id}
          projectName={selectedProject.name}
          currentUser={currentUser}
          onClose={() => setIsDeleteModalOpen(false)}
          onDeleted={onProjectDeleted}
        />
      )}
    </section>
  );
}
