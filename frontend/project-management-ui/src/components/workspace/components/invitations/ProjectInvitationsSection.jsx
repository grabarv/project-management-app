import { useMemo, useState } from "react";
import {
  cancelProjectInvitation,
  createProjectInvitation,
} from "../../../../services/projectInvitationApi";
import { useNotification } from "../../../notification/notificationContext";
import { useWorkspaceContext } from "../../WorkspaceContext";

/**
 * Creator-side invitation management for the selected project.
 * Uses username input for now because the app still lacks a user search endpoint.
 */
export default function ProjectInvitationsSection() {
  const {
    currentUser,
    selectedProject,
    isCreator,
    actions: { reloadProjects },
  } = useWorkspaceContext();
  const { showError, showSuccess } = useNotification();
  const [invitedUsername, setInvitedUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeInvitationId, setActiveInvitationId] = useState(null);

  const pendingInvitations = useMemo(
    () =>
      (selectedProject?.invitations ?? []).filter(
        (invitation) => invitation.status === "Pending"
      ),
    [selectedProject]
  );

  if (!selectedProject) {
    return null;
  }

  const handleInviteSubmit = async (event) => {
    event.preventDefault();

    if (!isCreator) {
      return;
    }
    if (!currentUser?.userId) {
      showError("Missing user information. Please sign in again.");
      return;
    }

    const normalizedUsername = invitedUsername.trim();
    if (!normalizedUsername) {
      showError("Provide a valid username.");
      return;
    }

    setIsSubmitting(true);

    const result = await createProjectInvitation(
      selectedProject.id,
      { invitedUsername: normalizedUsername },
      currentUser.userId
    );

    if (!result.ok) {
      showError(result.message || "Failed to send invitation");
      setIsSubmitting(false);
      return;
    }

    setInvitedUsername("");
    showSuccess("Invitation sent.");
    await reloadProjects();
    setIsSubmitting(false);
  };

  const handleCancelInvitation = async (invitationId) => {
    if (!currentUser?.userId) {
      showError("Missing user information. Please sign in again.");
      return;
    }

    setActiveInvitationId(invitationId);

    const result = await cancelProjectInvitation(invitationId, currentUser.userId);
    if (!result.ok) {
      showError(result.message || "Failed to cancel invitation");
      setActiveInvitationId(null);
      return;
    }

    showSuccess("Invitation canceled.");
    await reloadProjects();
    setActiveInvitationId(null);
  };

  return (
    <section className="project-tasks-panel project-tasks-panel-secondary">
      <div className="project-tasks-header">
        <h3>Participants & invitations</h3>
      </div>

      <div className="participant-list">
        <span className="participant-chip participant-chip-owner">
          {selectedProject.createdByUserId === currentUser?.userId ? "You" : "Creator"}
        </span>
        {(selectedProject.participatingUsers ?? []).map((user) => (
          <span key={user.id} className="participant-chip">
            {user.username}
          </span>
        ))}
      </div>

      {isCreator && (
        <form className="invitation-form" onSubmit={handleInviteSubmit}>
          <label htmlFor="invited-username">Invite by username</label>
          <div className="invitation-form-row">
            <input
              id="invited-username"
              type="text"
              placeholder="Username"
              value={invitedUsername}
              onChange={(event) => setInvitedUsername(event.target.value)}
            />
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send invite"}
            </button>
          </div>
          <p className="workspace-info">
            Temporary input: enter an existing username until user search is added.
          </p>
        </form>
      )}

      {isCreator && (
        <>
          {pendingInvitations.length === 0 ? (
            <p className="workspace-info">No pending invitations for this project.</p>
          ) : (
            <ul className="project-list invitation-list">
              {pendingInvitations.map((invitation) => (
                <li key={invitation.id} className="invitation-item">
                  <div>
                    <p className="invitation-title">{invitation.invitedUsername}</p>
                    <p className="invitation-meta">
                      Sent on {new Date(invitation.createdAtUtc).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="danger"
                    disabled={activeInvitationId === invitation.id}
                    onClick={() => handleCancelInvitation(invitation.id)}
                  >
                    {activeInvitationId === invitation.id ? "Working..." : "Cancel"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
