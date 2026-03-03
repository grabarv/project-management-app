import { useMemo, useState } from "react";
import { updateTask } from "../../../../services/taskApi";
import { toApiDateTime } from "../../shared/utils";
import { useNotification } from "../../../notification/notificationContext";
import { useWorkspaceContext } from "../../WorkspaceContext";
import { useWorkspaceDetailsContext } from "../details/WorkspaceDetailsContext";

function toDateInputValue(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().slice(0, 10);
}

/**
 * Creator-only form for updating an existing task.
 */
export default function WorkspaceUpdateTaskForm() {
  const { currentUser, selectedProject } = useWorkspaceContext();
  const { selectedTask: task, handleTaskUpdated, closeTaskView } = useWorkspaceDetailsContext();
  const [formData, setFormData] = useState({
    name: task?.name ?? "",
    description: task?.description ?? "",
    dueDate: toDateInputValue(task?.dueDateUtc),
    assignedToUserId: String(task?.assignedToUserId ?? ""),
    status: task?.status ?? "InProgress",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showError, showSuccess } = useNotification();

  const assignableUsers = useMemo(() => {
    const participants = selectedProject?.participatingUsers ?? [];
    const current = currentUser?.userId
      ? [{ id: currentUser.userId, username: `${currentUser.username} (You)` }]
      : [];

    return [...current, ...participants]
      .filter((user, index, array) => array.findIndex((item) => item.id === user.id) === index)
      .sort((a, b) => a.username.localeCompare(b.username));
  }, [selectedProject, currentUser]);

  const createdAtMinDate = useMemo(() => toDateInputValue(task?.createdAtUtc), [task]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!task?.id) {
      showError("Select a task first.");
      return;
    }
    if (!currentUser?.userId) {
      showError("Missing user information. Please sign in again.");
      return;
    }
    if (!formData.assignedToUserId) {
      showError("Choose a user to assign the task to.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.dueDate)) {
      showError("Please provide the date in a valid format.");
      return;
    }

    const dueDateUtc = toApiDateTime(formData.dueDate);
    if (!dueDateUtc) {
      showError("Please provide a valid due date.");
      return;
    }
    if (createdAtMinDate && formData.dueDate < createdAtMinDate) {
      showError("Due date cannot be earlier than creation date.");
      return;
    }

    setIsSubmitting(true);

    const result = await updateTask(
      task.id,
      {
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
        dueDateUtc,
        assignedToUserId: Number(formData.assignedToUserId),
      },
      currentUser.userId
    );

    if (!result.ok) {
      showError(result.message || "Failed to update task");
      setIsSubmitting(false);
      return;
    }

    showSuccess("Task updated.");
    await handleTaskUpdated(result.data);
    setIsSubmitting(false);
  };

  return (
    <article className="task-details-view" aria-label="Update task">
      <div className="task-details-header">
        <h3>Update Task</h3>
        <button type="button" className="neutral" onClick={closeTaskView}>
          Back to project
        </button>
      </div>

      <form className="create-project-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Task name"
          required
          value={formData.name}
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder="Task description"
          required
          value={formData.description}
          onChange={handleChange}
        />
        <select
          name="assignedToUserId"
          required
          value={formData.assignedToUserId}
          onChange={handleChange}
        >
          <option value="">Assign to user</option>
          {assignableUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.username}
            </option>
          ))}
        </select>
        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="InProgress">In Progress</option>
          <option value="Done">Done</option>
        </select>
        <input
          type="date"
          name="dueDate"
          required
          min={createdAtMinDate || undefined}
          value={formData.dueDate}
          onChange={handleChange}
        />

        <div className="create-project-actions">
          <button type="button" className="neutral" onClick={closeTaskView} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </article>
  );
}
