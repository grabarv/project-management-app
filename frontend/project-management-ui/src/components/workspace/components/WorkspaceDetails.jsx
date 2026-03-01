import { useEffect, useState } from "react";
import { formatDate } from "../utils";
import ProjectDeleteConfirmModal from "./ProjectDeleteConfirmModal";
import ProjectTasksTable from "./ProjectTasksTable";
import TaskDetailsDrawer from "./TaskDetailsDrawer";
import WorkspaceCreateTaskForm from "./WorkspaceCreateTaskForm";

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
  const [tasksRefreshKey, setTasksRefreshKey] = useState(0);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  useEffect(() => {
    setSelectedTask(null);
    setIsCreateTaskOpen(false);
  }, [selectedProject?.id]);

  const handleTaskUpdated = (updatedTask) => {
    setSelectedTask(updatedTask);
    setTasksRefreshKey((value) => value + 1);
  };

  const handleTaskCreated = async (createdTask) => {
    setIsCreateTaskOpen(false);
    setTasksRefreshKey((value) => value + 1);
    setSelectedTask(createdTask);
  };

  const handleTaskDeleted = () => {
    setTasksRefreshKey((value) => value + 1);
  };

  return (
    <section className="workspace-column workspace-details">
      {selectedProject ? (
        selectedTask ? (
          <TaskDetailsDrawer
            task={selectedTask}
            currentUser={currentUser}
            onClose={() => setSelectedTask(null)}
            onTaskUpdated={handleTaskUpdated}
          />
        ) : (
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
                  <button
                    type="button"
                    className="neutral"
                    onClick={() => setIsCreateTaskOpen((value) => !value)}
                  >
                    {isCreateTaskOpen ? "Close task form" : "Create task"}
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => setIsDeleteModalOpen(true)}
                  >
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
                currentUser={currentUser}
                selectedProject={selectedProject}
                onTaskCreated={handleTaskCreated}
                onCancel={() => setIsCreateTaskOpen(false)}
              />
            )}
            <ProjectTasksTable
              currentUser={currentUser}
              selectedProject={selectedProject}
              onTaskSelect={setSelectedTask}
              onTaskDeleted={handleTaskDeleted}
              refreshKey={tasksRefreshKey}
            />
          </article>
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
