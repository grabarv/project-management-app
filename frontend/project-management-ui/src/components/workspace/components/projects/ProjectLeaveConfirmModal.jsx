import { useState } from "react";
import { leaveProject } from "../../../../services/projectApi";
import { useNotification } from "../../../notification/notificationContext";
import ConfirmModal from "../shared/ConfirmModal/ConfirmModal";
import { useWorkspaceContext } from "../../WorkspaceContext";

/**
 * Confirms participant self-removal from the selected project.
 * Leaving also removes tasks assigned to the current user in this project.
 */
export default function ProjectLeaveConfirmModal({ onClose }) {
  const {
    currentUser,
    selectedProject,
    actions: { handleProjectLeft },
  } = useWorkspaceContext();
  const { showError, showSuccess } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmLeave = async () => {
    if (!currentUser?.userId) {
      showError("Missing user information. Please sign in again.");
      return;
    }

    if (!selectedProject?.id) {
      showError("Select a project first.");
      return;
    }

    setIsSubmitting(true);

    const result = await leaveProject(selectedProject.id, currentUser.userId);

    if (!result.ok) {
      showError(result.message || "Failed to leave project");
      setIsSubmitting(false);
      return;
    }

    showSuccess("You left the project.");
    await handleProjectLeft();
    setIsSubmitting(false);
    onClose();
  };

  return (
    <ConfirmModal
      title="Leave project?"
      message={
        <>
          You will lose access to <strong>{selectedProject?.name}</strong> and all tasks assigned
          to you in this project will be deleted.
        </>
      }
      confirmLabel="Leave project"
      submittingLabel="Leaving..."
      isSubmitting={isSubmitting}
      onClose={onClose}
      onConfirm={handleConfirmLeave}
    />
  );
}
