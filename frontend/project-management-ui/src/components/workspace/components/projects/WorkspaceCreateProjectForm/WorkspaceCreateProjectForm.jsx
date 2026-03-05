import { useMemo, useState } from "react";
import { createProject } from "../../../../../services/projectApi";
import { EMPTY_CREATE_FORM } from "../../../shared/constants";
import { requireCurrentUserId, getValidatedDueDateUtc } from "../../../shared/formValidation";
import { useObjectForm } from "../../../hooks/useObjectForm";
import { useNotification } from "../../../../notification/notificationContext";
import { useWorkspaceContext } from "../../../WorkspaceContext";
import "./WorkspaceCreateProjectForm.css";

/**
 * Project creation form view rendered on the right side of the workspace.
 * Keeps form state local and reports success to parent via callback.
 */
export default function WorkspaceCreateProjectForm() {
  const {
    currentUser,
    actions: { cancelPanel, handleProjectCreated },
  } = useWorkspaceContext();
  const { formData, setFormData, handleChange } = useObjectForm(EMPTY_CREATE_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showError, showSuccess } = useNotification();

  const todayDateString = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const handleCreateSubmit = async (event) => {
    event.preventDefault();

    const currentUserId = requireCurrentUserId(currentUser, showError);
    if (!currentUserId) {
      return;
    }

    const dueDateUtc = getValidatedDueDateUtc({
      rawValue: formData.dueDate,
      minDate: todayDateString,
      showError,
    });
    if (!dueDateUtc) {
      return;
    }

    setIsSubmitting(true);

    // Only creator is assigned initially; participants can be managed later.
    const result = await createProject(
      {
        name: formData.name.trim(),
        description: formData.description.trim(),
        dueDateUtc,
        createdByUserId: currentUserId,
        participatingUserIds: [],
      },
      currentUserId
    );

    if (!result.ok) {
      showError(result.message || "Failed to create project");
      setIsSubmitting(false);
      return;
    }

    setFormData(EMPTY_CREATE_FORM);
    showSuccess("Project created.");
    await handleProjectCreated(result.data?.id ?? null);
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
            value={formData.name}
            onChange={handleChange}
          />
          <textarea
            name="description"
            placeholder="Description"
            required
            value={formData.description}
            onChange={handleChange}
          />
          <input
            type="date"
            name="dueDate"
            required
            min={todayDateString}
            value={formData.dueDate}
            onChange={handleChange}
          />

          <div className="create-project-actions">
            <button type="button" className="neutral" onClick={cancelPanel} disabled={isSubmitting}>
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
