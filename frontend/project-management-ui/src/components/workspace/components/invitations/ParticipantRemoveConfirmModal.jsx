import { useState } from "react";
import { removeProjectParticipant } from "../../../../services/projectApi";
import { useNotification } from "../../../notification/notificationContext";
import ConfirmModal from "../shared/ConfirmModal";
import { useWorkspaceContext } from "../../WorkspaceContext";

/**
 * Confirms participant removal before removing the user and their project tasks.
 */
export default function ParticipantRemoveConfirmModal({
  participantUserId,
  participantUsername,
  onClose,
}) {
  const {
    currentUser,
    selectedProject,
    actions: { reloadProjects },
  } = useWorkspaceContext();
  const { showError, showSuccess } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmRemove = async () => {
    if (!currentUser?.userId || !selectedProject?.id) {
      showError("Missing user information. Please sign in again.");
      return;
    }

    setIsSubmitting(true);

    const result = await removeProjectParticipant(
      selectedProject.id,
      participantUserId,
      currentUser.userId
    );

    if (!result.ok) {
      showError(result.message || "Failed to remove participant");
      setIsSubmitting(false);
      return;
    }

    showSuccess(`Removed ${participantUsername} from project.`);
    await reloadProjects();
    setIsSubmitting(false);
    onClose();
  };

  return (
    <ConfirmModal
      title="Remove participant?"
      message={
        <>
          This will remove <strong>{participantUsername}</strong> from the project and delete
          all tasks assigned to them in this project.
        </>
      }
      confirmLabel="Remove participant"
      isSubmitting={isSubmitting}
      onClose={onClose}
      onConfirm={handleConfirmRemove}
    />
  );
}
