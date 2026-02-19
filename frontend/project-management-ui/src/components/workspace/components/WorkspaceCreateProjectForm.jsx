import { useMemo, useState } from "react";
import { createProject } from "../../../services/projectApi";
import { EMPTY_CREATE_FORM } from "../constants";
import { toApiDateTime } from "../utils";
import { useNotification } from "../../notification/notificationContext";

/**
 * Project creation form view rendered on the right side of the workspace.
 * Keeps form state local and reports success to parent via callback.
 */
export default function WorkspaceCreateProjectForm({ currentUser, onCancel, onProjectCreated }) {
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showError, showSuccess } = useNotification();

  const todayDateString = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const handleCreateChange = (event) => {
    const { name, value } = event.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();

    if (!currentUser?.userId) {
      showError("Missing user information. Please sign in again.");
      return;
    }

    const dueDateUtc = toApiDateTime(createForm.dueDate);
    if (!dueDateUtc) {
      showError("Please provide a valid due date.");
      return;
    }
    if (createForm.dueDate < todayDateString) {
      showError("Due date cannot be earlier than creation date.");
      return;
    }

    setIsSubmitting(true);

    // Only creator is assigned initially; participants can be managed later.
    const result = await createProject(
      {
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        dueDateUtc,
        createdByUserId: currentUser.userId,
        participatingUserIds: [],
      },
      currentUser.userId
    );

    if (!result.ok) {
      showError(result.message || "Failed to create project");
      setIsSubmitting(false);
      return;
    }

    setCreateForm(EMPTY_CREATE_FORM);
    showSuccess("Project created.");
    await onProjectCreated(result.data?.id ?? null);
    setIsSubmitting(false);
  };

  return (
    <section className="workspace-column workspace-details">
      <article className="workspace-create-panel">
        <h2>Create project</h2>
        <p>Fill in the basic information to create a new project.</p>

        <form className="create-project-form" onSubmit={handleCreateSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Project name"
            required
            value={createForm.name}
            onChange={handleCreateChange}
          />
          <textarea
            name="description"
            placeholder="Description"
            required
            value={createForm.description}
            onChange={handleCreateChange}
          />
          <input
            type="date"
            name="dueDate"
            required
            min={todayDateString}
            value={createForm.dueDate}
            onChange={handleCreateChange}
          />

          <div className="create-project-actions">
            <button type="button" className="neutral" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Working..." : "Create"}
            </button>
          </div>
        </form>
      </article>
    </section>
  );
}
