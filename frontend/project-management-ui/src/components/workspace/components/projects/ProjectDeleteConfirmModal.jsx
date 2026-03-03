import { useState } from "react";
import { deleteProject } from "../../../../services/projectApi";
import { useNotification } from "../../../notification/notificationContext";

/**
 * Confirmation modal for destructive project deletion.
 * Owns delete request state so parent components stay orchestration-focused.
 */
export default function ProjectDeleteConfirmModal({
  projectId,
  projectName,
  currentUser,
  onClose,
  onDeleted,
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { showError, showSuccess } = useNotification();

  const handleConfirmDelete = async () => {
    if (!currentUser?.userId) {
      showError("Missing user information. Please sign in again.");
      return;
    }

    setIsDeleting(true);

    const result = await deleteProject(projectId, currentUser.userId);
    if (!result.ok) {
      showError(result.message || "Failed to delete project");
      setIsDeleting(false);
      return;
    }

    showSuccess("Project deleted.");
    await onDeleted();
    setIsDeleting(false);
    onClose();
  };

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-project-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="delete-project-title">Delete project?</h3>
        <p>
          This action will permanently remove <strong>{projectName}</strong>.
        </p>
        <div className="modal-actions">
          <button type="button" className="neutral" disabled={isDeleting} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="danger" disabled={isDeleting} onClick={handleConfirmDelete}>
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
