export default function WorkspaceCreateProjectForm({
  createForm,
  onCreateChange,
  onCreateSubmit,
  onCancel,
  isSubmitting,
  todayDateString,
}) {
  return (
    <section className="workspace-column workspace-details">
      <article className="workspace-create-panel">
        <h2>Create project</h2>
        <p>Fill in the basic information to create a new project.</p>

        <form className="create-project-form" onSubmit={onCreateSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Project name"
            required
            value={createForm.name}
            onChange={onCreateChange}
          />
          <textarea
            name="description"
            placeholder="Description"
            required
            value={createForm.description}
            onChange={onCreateChange}
          />
          <input
            type="date"
            name="dueDate"
            required
            min={todayDateString}
            value={createForm.dueDate}
            onChange={onCreateChange}
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
