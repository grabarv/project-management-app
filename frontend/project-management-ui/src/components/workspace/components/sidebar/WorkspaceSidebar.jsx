import WorkspaceProjectGroup from "./WorkspaceProjectGroup";
import { useWorkspaceContext } from "../../WorkspaceContext";
import ReceivedInvitationsPanel from "../invitations/ReceivedInvitationsPanel";

/**
 * Left-side project navigation panel.
 */
export default function WorkspaceSidebar() {
  const {
    currentUser,
    userProjects,
    selectedProjectId,
    isLoading,
    actions: { startCreateProject, selectProject },
  } = useWorkspaceContext();
  const createdProjects = userProjects.filter(
    (project) => project.createdByUserId === currentUser?.userId
  );
  const participatingProjects = userProjects.filter(
    (project) => project.createdByUserId !== currentUser?.userId
  );

  return (
    <section
      className="workspace-column workspace-sidebar"
      tabIndex={0}
      aria-label="Workspace sidebar"
    >
      <div className="workspace-header">
        <h2>My projects</h2>
        <p>{currentUser?.username || "User"}</p>
      </div>

      <button type="button" className="new-project-button" onClick={startCreateProject}>
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
            onSelectProject={selectProject}
          />
          <WorkspaceProjectGroup
            title="Participating"
            projects={participatingProjects}
            itemClassName="project-item-participating"
            badgeLabel="Member"
            selectedProjectId={selectedProjectId}
            onSelectProject={selectProject}
          />
        </div>
      )}

      <ReceivedInvitationsPanel />
    </section>
  );
}
