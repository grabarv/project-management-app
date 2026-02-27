import { formatDate } from "../utils";

/**
 * Task details view shown in place of project details.
 */
export default function TaskDetailsDrawer({ task, onClose }) {
  if (!task) {
    return null;
  }

  return (
    <article className="task-details-view" aria-label="Task details">
      <div className="task-details-header">
        <h3>Task Details</h3>
        <button type="button" className="neutral" onClick={onClose}>
          Back to project
        </button>
      </div>

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
    </article>
  );
}
