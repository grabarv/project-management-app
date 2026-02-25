import WorkspaceProjectGroup from "./WorkspaceProjectGroup";

/**
 * Left-side project navigation panel.
 */
export default function WorkspaceSidebar({
  currentUser,
  onStartCreateProject,
  isLoading,
  userProjects,
  selectedProjectId,
  onSelectProject,
}) {
  const createdProjects = userProjects.filter(
    (project) => project.createdByUserId === currentUser?.userId
  );
  const participatingProjects = userProjects.filter(
    (project) => project.createdByUserId !== currentUser?.userId
  );

  return (
    <section className="workspace-column workspace-sidebar">
      <div className="workspace-header">
        <h2>My projects</h2>
        <p>{currentUser?.username || "User"}</p>
      </div>

      <button type="button" className="new-project-button" onClick={onStartCreateProject}>
        + New project
      </button>

      {isLoading && <p className="workspace-info">Loading projects...</p>}
      {!isLoading && userProjects.length === 0 && (
        <p className="workspace-info">No projects assigned yet.</p>
      )}

      {!isLoading && userProjects.length > 0 && (
        <div className="project-groups">
          <WorkspaceProjectGroup
            title="Created by you"
            projects={createdProjects}
            itemClassName="project-item-owned"
            badgeLabel="Owner"
            selectedProjectId={selectedProjectId}
            onSelectProject={onSelectProject}
          />
          <WorkspaceProjectGroup
            title="Participating"
            projects={participatingProjects}
            itemClassName="project-item-participating"
            badgeLabel="Member"
            selectedProjectId={selectedProjectId}
            onSelectProject={onSelectProject}
          />
        </div>
      )}
    </section>
  );
}
