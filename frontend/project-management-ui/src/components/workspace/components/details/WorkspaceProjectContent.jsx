import { useState } from "react";
import ProjectDeleteConfirmModal from "../projects/ProjectDeleteConfirmModal";
import ProjectDetailsContent from "./ProjectDetailsContent";

/**
 * Selected-project branch of the workspace details panel.
 */
export default function WorkspaceProjectContent() {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <>
      <ProjectDetailsContent onOpenProjectDelete={() => setIsDeleteModalOpen(true)} />
      {isDeleteModalOpen && (
        <ProjectDeleteConfirmModal onClose={() => setIsDeleteModalOpen(false)} />
      )}
    </>
  );
}
