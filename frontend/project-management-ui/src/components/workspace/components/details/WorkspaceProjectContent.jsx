import { useState } from "react";
import ProjectDeleteConfirmModal from "../projects/ProjectDeleteConfirmModal";
import { useWorkspaceContext } from "../../WorkspaceContext";
import ProjectDetailsContent from "./ProjectDetailsContent";

/**
 * Selected-project branch of the workspace details panel.
 */
export default function WorkspaceProjectContent({ taskControls }) {
  const {
    selectedProject,
    actions: { handleProjectDeleted },
  } = useWorkspaceContext();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <>
      <ProjectDetailsContent
        isCreateTaskOpen={taskControls.isCreateTaskOpen}
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
          onClose={() => setIsDeleteModalOpen(false)}
          onDeleted={handleProjectDeleted}
        />
      )}
    </>
  );
}
