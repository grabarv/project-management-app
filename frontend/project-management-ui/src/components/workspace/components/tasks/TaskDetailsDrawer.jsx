import { useState } from "react";
import { formatDate } from "../../shared/utils";
import { toggleTaskDone } from "../../../../services/taskApi";
import { useWorkspaceContext } from "../../WorkspaceContext";

/**
 * Task details view shown in place of project details.
 */
export default function TaskDetailsDrawer({ task, onClose, onTaskUpdated }) {
  const { currentUser } = useWorkspaceContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!task) {
    return null;
  }

  const isAssignedUser = task.assignedToUserId === currentUser?.userId;
  const isDone = task.status === "Done";

  const handleToggleDone = async () => {
    if (!task.id || !currentUser?.userId || !isAssignedUser) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const result = await toggleTaskDone(task.id, currentUser.userId);
    if (!result.ok) {
      setErrorMessage(result.message || "Failed to update task status");
      setIsSubmitting(false);
      return;
    }

    onTaskUpdated?.(result.data);
    setIsSubmitting(false);
  };

  return (
    <article className="task-details-view" aria-label="Task details">
      <div className="task-details-header">
        <h3>Task Details</h3>
        <button type="button" className="neutral" onClick={onClose}>
          Back to project
        </button>
      </div>

      {errorMessage && <p className="workspace-error">{errorMessage}</p>}

      <div className="task-details-body">
        <p>
          <strong>Name:</strong> {task.name}
        </p>
        <p>
          <strong>Description:</strong> {task.description}
        </p>
        <p>
          <strong>Status:</strong> {task.status}
        </p>
        <p>
          <strong>Created:</strong> {formatDate(task.createdAtUtc)}
        </p>
        <p>
          <strong>Due:</strong> {formatDate(task.dueDateUtc)}
        </p>
        <p>
          <strong>Assigned To:</strong> {task.assignedToUsername || `User #${task.assignedToUserId}`}
        </p>
        <p>
          <strong>Assigned By:</strong> {task.assignedByUsername || "Unknown"}
        </p>
      </div>

      {isAssignedUser && (
        <div className="task-details-actions">
          <button type="button" className="neutral" disabled={isSubmitting} onClick={handleToggleDone}>
            {isSubmitting ? "Saving..." : isDone ? "Unmark task" : "Mark as done"}
          </button>
        </div>
      )}
    </article>
  );
}
