import { useMemo, useState } from "react";
import { updateProject } from "../../../../services/projectApi";
import { toApiDateTime, toDateInputValue } from "../../shared/utils";
import { useNotification } from "../../../notification/notificationContext";
import { useWorkspaceContext } from "../../WorkspaceContext";

/**
 * Project update form rendered in the right panel for the selected project.
 */
export default function WorkspaceUpdateProjectForm() {
  const {
    currentUser,
    selectedProject,
    actions: { cancelPanel, handleProjectUpdated },
  } = useWorkspaceContext();
  const [formData, setFormData] = useState({
    name: selectedProject?.name ?? "",
    description: selectedProject?.description ?? "",
    dueDate: toDateInputValue(selectedProject?.dueDateUtc),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showError, showSuccess } = useNotification();

  const createdAtMinDate = useMemo(
    () => toDateInputValue(selectedProject?.createdAtUtc),
    [selectedProject]
  );

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

    const result = await updateProject(
      selectedProject.id,
      {
        name: formData.name.trim(),
        description: formData.description.trim(),
        dueDateUtc,
        participatingUserIds: selectedProject.participatingUserIds ?? [],
      },
      currentUser.userId
    );

    if (!result.ok) {
      showError(result.message || "Failed to update project");
      setIsSubmitting(false);
      return;
    }

    showSuccess("Project updated.");
    await handleProjectUpdated(selectedProject.id);
    setIsSubmitting(false);
  };

  return (
    <section className="workspace-column workspace-details">
      <article className="workspace-create-panel">
        <h2>Update project</h2>
        <p>Edit project information and save your changes.</p>

        <form className="create-project-form" onSubmit={handleSubmit}>
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
            min={createdAtMinDate || undefined}
            value={formData.dueDate}
            onChange={handleChange}
          />

          <div className="create-project-actions">
            <button type="button" className="neutral" onClick={cancelPanel} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </article>
    </section>
  );
}
