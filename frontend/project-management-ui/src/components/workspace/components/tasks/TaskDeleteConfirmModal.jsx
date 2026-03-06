import { useState } from "react";
import { deleteTask } from "../../../../services/taskApi";
import { useNotification } from "../../../notification/notificationContext";
import ConfirmModal from "../shared/ConfirmModal/ConfirmModal";
import { useWorkspaceContext } from "../../WorkspaceContext";
import { useWorkspaceDetailsContext } from "../details/WorkspaceDetailsContext";

/**
 * Confirmation modal for destructive task deletion.
 */
export default function TaskDeleteConfirmModal({ taskId, taskName, onClose }) {
  const { currentUser } = useWorkspaceContext();
  const { handleTaskDeleted } = useWorkspaceDetailsContext();
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
    await handleTaskDeleted();
    setIsDeleting(false);
    onClose();
  };

  return (
    <ConfirmModal
      title="Delete task?"
      message={
        <>
          This action will permanently remove <strong>{taskName}</strong>.
        </>
      }
      submittingLabel="Deleting..."
      isSubmitting={isDeleting}
      onClose={onClose}
      onConfirm={handleConfirmDelete}
    />
  );
}
