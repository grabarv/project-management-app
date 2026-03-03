import { useMemo, useState } from "react";
import { updateTask } from "../../../../services/taskApi";
import { toDateInputValue } from "../../shared/utils";
import { requireCurrentUserId, getValidatedDueDateUtc } from "../../shared/formValidation";
import { buildAssignableUsers } from "../../shared/taskUtils";
import { useObjectForm } from "../../hooks/useObjectForm";
import { useNotification } from "../../../notification/notificationContext";
import { useWorkspaceContext } from "../../WorkspaceContext";
import { useWorkspaceDetailsContext } from "../details/WorkspaceDetailsContext";

/**
 * Creator-only form for updating an existing task.
 */
export default function WorkspaceUpdateTaskForm() {
  const { currentUser, selectedProject } = useWorkspaceContext();
  const { selectedTask: task, handleTaskUpdated, closeTaskView } = useWorkspaceDetailsContext();
  const { formData, handleChange } = useObjectForm({
    name: task?.name ?? "",
    description: task?.description ?? "",
    dueDate: toDateInputValue(task?.dueDateUtc),
    assignedToUserId: String(task?.assignedToUserId ?? ""),
    status: task?.status ?? "InProgress",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showError, showSuccess } = useNotification();

  const assignableUsers = useMemo(
    () => buildAssignableUsers(selectedProject, currentUser),
    [selectedProject, currentUser]
  );

  const createdAtMinDate = useMemo(() => toDateInputValue(task?.createdAtUtc), [task]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!task?.id) {
      showError("Select a task first.");
      return;
    }
    const currentUserId = requireCurrentUserId(currentUser, showError);
    if (!currentUserId) {
      return;
    }
    if (!formData.assignedToUserId) {
      showError("Choose a user to assign the task to.");
      return;
    }
    const dueDateUtc = getValidatedDueDateUtc({
      rawValue: formData.dueDate,
      minDate: createdAtMinDate,
      showError,
      requireDateInputFormat: true,
    });
    if (!dueDateUtc) {
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
      currentUserId
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
