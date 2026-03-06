import { useState } from "react";
import ProjectDeleteConfirmModal from "../projects/ProjectDeleteConfirmModal";
import ProjectLeaveConfirmModal from "../projects/ProjectLeaveConfirmModal";
import ProjectDetailsContent from "./ProjectDetailsContent";

/**
 * Selected-project branch of the workspace details panel.
 */
export default function WorkspaceProjectContent() {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  return (
    <>
      <ProjectDetailsContent
        onOpenProjectDelete={() => setIsDeleteModalOpen(true)}
        onOpenProjectLeave={() => setIsLeaveModalOpen(true)}
      />
      {isDeleteModalOpen && (
        <ProjectDeleteConfirmModal onClose={() => setIsDeleteModalOpen(false)} />
      )}
      {isLeaveModalOpen && <ProjectLeaveConfirmModal onClose={() => setIsLeaveModalOpen(false)} />}
    </>
  );
}
