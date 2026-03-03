import { useMemo, useState } from "react";
import ProjectDeleteConfirmModal from "../projects/ProjectDeleteConfirmModal";
import ProjectDetailsContent from "./ProjectDetailsContent";

/**
 * Selected-project branch of the workspace details panel.
 */
export default function WorkspaceProjectContent({
  currentUser,
  selectedProject,
  onProjectDeleted,
  onStartUpdateProject,
  taskControls,
}) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const isCreator = useMemo(
    () => selectedProject?.createdByUserId === currentUser?.userId,
    [selectedProject, currentUser]
  );

  return (
    <>
      <ProjectDetailsContent
        currentUser={currentUser}
        selectedProject={selectedProject}
        isCreator={isCreator}
        isCreateTaskOpen={taskControls.isCreateTaskOpen}
        onStartUpdateProject={onStartUpdateProject}
        onToggleCreateTask={taskControls.toggleCreateTask}
        onOpenProjectDelete={() => setIsDeleteModalOpen(true)}
        onTaskCreated={taskControls.handleTaskCreated}
        onCancelCreateTask={taskControls.closeCreateTask}
        onTaskSelect={taskControls.openTaskDetails}
        onTaskEdit={taskControls.openTaskEdit}
        onTaskDeleted={taskControls.handleTaskDeleted}
        tasksRefreshKey={taskControls.tasksRefreshKey}
      />
      {isDeleteModalOpen && (
        <ProjectDeleteConfirmModal
          projectId={selectedProject.id}
          projectName={selectedProject.name}
          currentUser={currentUser}
          onClose={() => setIsDeleteModalOpen(false)}
          onDeleted={onProjectDeleted}
        />
      )}
    </>
  );
}
