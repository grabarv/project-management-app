import { useMemo, useState } from "react";
import { createProjectTask } from "../../../services/taskApi";
import { toApiDateTime } from "../utils";
import { useNotification } from "../../notification/notificationContext";

function toDateInputValue(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().slice(0, 10);
}

/**
 * Creator-only form for creating tasks assigned to other users in the current project.
 */
export default function WorkspaceCreateTaskForm({
  currentUser,
  selectedProject,
  onTaskCreated,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dueDate: "",
    assignedToUserId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showError, showSuccess } = useNotification();

  const assignableUsers = useMemo(
    () => {
      const participants = selectedProject?.participatingUsers ?? [];
      const creator = currentUser?.userId
        ? [{ id: currentUser.userId, username: `${currentUser.username} (You)` }]
        : [];

      return [...creator, ...participants]
        .filter((user, index, array) => array.findIndex((item) => item.id === user.id) === index)
        .sort((a, b) => a.username.localeCompare(b.username));
    },
    [selectedProject, currentUser]
  );

  const todayDateString = useMemo(() => toDateInputValue(new Date().toISOString()), []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedProject?.id) {
      showError("Select a project first.");
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

    const dueDateUtc = toApiDateTime(formData.dueDate);
    if (!dueDateUtc) {
      showError("Please provide a valid due date.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.dueDate)) {
      showError("Please provide the date in a valid format.");
      return;
    }
    if (formData.dueDate < todayDateString) {
      showError("Due date cannot be earlier than creation date.");
      return;
    }

    setIsSubmitting(true);

    const result = await createProjectTask(
      selectedProject.id,
      {
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: "InProgress",
        dueDateUtc,
        assignedToUserId: Number(formData.assignedToUserId),
      },
      currentUser.userId
    );

    if (!result.ok) {
      showError(result.message || "Failed to create task");
      setIsSubmitting(false);
      return;
    }

    showSuccess("Task created.");
    await onTaskCreated(result.data);
    setIsSubmitting(false);
  };

  return (
    <section className="project-tasks-panel project-tasks-panel-secondary">
      <div className="project-tasks-header">
        <h3>Create Task</h3>
      </div>

      {assignableUsers.length === 0 ? (
        <p className="workspace-info">No assignable users are available for this project.</p>
      ) : (
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
          <input
            type="date"
            name="dueDate"
            required
            min={todayDateString}
            value={formData.dueDate}
            onChange={handleChange}
          />

          <div className="create-project-actions">
            <button type="button" className="neutral" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create task"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
