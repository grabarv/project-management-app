import { useState } from "react";
import { deleteTask } from "../../../../services/taskApi";
import { useNotification } from "../../../notification/notificationContext";

/**
 * Confirmation modal for destructive task deletion.
 */
export default function TaskDeleteConfirmModal({
  taskId,
  taskName,
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

    const result = await deleteTask(taskId, currentUser.userId);
    if (!result.ok) {
      showError(result.message || "Failed to delete task");
      setIsDeleting(false);
      return;
    }

    showSuccess("Task deleted.");
    await onDeleted?.();
    setIsDeleting(false);
    onClose();
  };

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-task-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="delete-task-title">Delete task?</h3>
        <p>
          This action will permanently remove <strong>{taskName}</strong>.
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
