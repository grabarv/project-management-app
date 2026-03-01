import { useEffect, useState } from "react";
import ProjectDeleteConfirmModal from "./ProjectDeleteConfirmModal";
import TaskDetailsDrawer from "./TaskDetailsDrawer";
import WorkspaceUpdateTaskForm from "./WorkspaceUpdateTaskForm";
import ProjectDetailsContent from "./ProjectDetailsContent";

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
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskViewMode, setTaskViewMode] = useState("details");
  const [tasksRefreshKey, setTasksRefreshKey] = useState(0);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  useEffect(() => {
    setSelectedTask(null);
    setTaskViewMode("details");
    setIsCreateTaskOpen(false);
  }, [selectedProject?.id]);

  const handleTaskUpdated = (updatedTask) => {
    setSelectedTask(updatedTask);
    setTaskViewMode("details");
    setTasksRefreshKey((value) => value + 1);
  };

  const handleTaskCreated = async (createdTask) => {
    setIsCreateTaskOpen(false);
    setTasksRefreshKey((value) => value + 1);
    setSelectedTask(createdTask);
    setTaskViewMode("details");
  };

  const handleTaskDeleted = () => {
    setSelectedTask(null);
    setTaskViewMode("details");
    setTasksRefreshKey((value) => value + 1);
  };

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
              onCancel={() => {
                setSelectedTask(null);
                setTaskViewMode("details");
              }}
            />
          ) : (
            <TaskDetailsDrawer
              task={selectedTask}
              currentUser={currentUser}
              onClose={() => setSelectedTask(null)}
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
            onToggleCreateTask={() => setIsCreateTaskOpen((value) => !value)}
            onOpenProjectDelete={() => setIsDeleteModalOpen(true)}
            onTaskCreated={handleTaskCreated}
            onCancelCreateTask={() => setIsCreateTaskOpen(false)}
            onTaskSelect={(task) => {
              setSelectedTask(task);
              setTaskViewMode("details");
            }}
            onTaskEdit={(task) => {
              setSelectedTask(task);
              setTaskViewMode("edit");
            }}
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
