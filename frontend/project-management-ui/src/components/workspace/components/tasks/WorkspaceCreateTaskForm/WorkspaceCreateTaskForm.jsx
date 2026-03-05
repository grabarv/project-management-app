import { useMemo, useState } from "react";
import { createProjectTask } from "../../../../../services/taskApi";
import { toDateInputValue } from "../../../shared/utils";
import { requireCurrentUserId, getValidatedDueDateUtc } from "../../../shared/formValidation";
import { buildAssignableUsers } from "../../../shared/taskUtils";
import { useObjectForm } from "../../../hooks/useObjectForm";
import { useNotification } from "../../../../notification/notificationContext";
import { useWorkspaceContext } from "../../../WorkspaceContext";
import { useWorkspaceDetailsContext } from "../../details/WorkspaceDetailsContext";
import "./WorkspaceCreateTaskForm.css";

/**
 * Creator-only form for creating tasks assigned to users in the current project.
 */
export default function WorkspaceCreateTaskForm() {
  const { currentUser, selectedProject } = useWorkspaceContext();
  const { handleTaskCreated, closeCreateTask } = useWorkspaceDetailsContext();
  const { formData, handleChange } = useObjectForm({
    name: "",
    description: "",
    dueDate: "",
    assignedToUserId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showError, showSuccess } = useNotification();

  const assignableUsers = useMemo(
    () => buildAssignableUsers(selectedProject, currentUser),
    [selectedProject, currentUser]
  );

  const todayDateString = useMemo(() => toDateInputValue(new Date().toISOString()), []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedProject?.id) {
      showError("Select a project first.");
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
      minDate: todayDateString,
      showError,
      requireDateInputFormat: true,
    });
    if (!dueDateUtc) {
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
      currentUserId
    );

    if (!result.ok) {
      showError(result.message || "Failed to create task");
      setIsSubmitting(false);
      return;
    }

    showSuccess("Task created.");
    await handleTaskCreated(result.data);
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
            <button type="button" className="neutral" onClick={closeCreateTask} disabled={isSubmitting}>
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
