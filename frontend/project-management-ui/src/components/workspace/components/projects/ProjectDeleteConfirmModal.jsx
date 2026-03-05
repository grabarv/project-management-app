import { useState } from "react";
import { deleteProject } from "../../../../services/projectApi";
import { useNotification } from "../../../notification/notificationContext";
import ConfirmModal from "../shared/ConfirmModal/ConfirmModal";
import { useWorkspaceContext } from "../../WorkspaceContext";

/**
 * Confirmation modal for destructive project deletion.
 * Owns delete request state so parent components stay orchestration-focused.
 */
export default function ProjectDeleteConfirmModal({ onClose }) {
  const {
    currentUser,
    selectedProject,
    actions: { handleProjectDeleted },
  } = useWorkspaceContext();
  const [isDeleting, setIsDeleting] = useState(false);
  const { showError, showSuccess } = useNotification();

  const handleConfirmDelete = async () => {
    if (!selectedProject?.id) {
      showError("Select a project first.");
      return;
    }
    if (!currentUser?.userId) {
      showError("Missing user information. Please sign in again.");
      return;
    }

    setIsDeleting(true);

    const result = await deleteProject(selectedProject.id, currentUser.userId);
    if (!result.ok) {
      showError(result.message || "Failed to delete project");
      setIsDeleting(false);
      return;
    }

    showSuccess("Project deleted.");
    await handleProjectDeleted();
    setIsDeleting(false);
    onClose();
  };

  return (
    <ConfirmModal
      title="Delete project?"
      message={
        <>
          This action will permanently remove <strong>{selectedProject?.name}</strong>.
        </>
      }
      isSubmitting={isDeleting}
      onClose={onClose}
      onConfirm={handleConfirmDelete}
    />
  );
}
