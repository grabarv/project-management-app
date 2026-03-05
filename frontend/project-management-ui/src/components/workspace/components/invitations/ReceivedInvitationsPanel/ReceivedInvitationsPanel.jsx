import { useCallback, useEffect, useState } from "react";
import {
  acceptProjectInvitation,
  declineProjectInvitation,
  fetchReceivedProjectInvitations,
} from "../../../../../services/projectInvitationApi";
import { useNotification } from "../../../../notification/notificationContext";
import { useWorkspaceContext } from "../../../WorkspaceContext";
import "./ReceivedInvitationsPanel.css";

/**
 * Sidebar panel that lets the current user accept or decline pending invitations.
 */
export default function ReceivedInvitationsPanel() {
  const {
    currentUser,
    actions: { reloadProjects },
  } = useWorkspaceContext();
  const { showError, showSuccess } = useNotification();
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeInvitationId, setActiveInvitationId] = useState(null);

  const loadInvitations = useCallback(async ({ silent = false } = {}) => {
    if (!currentUser?.userId) {
      setInvitations([]);
      setIsLoading(false);
      return;
    }

    if (!silent) {
      setIsLoading(true);
    }

    const result = await fetchReceivedProjectInvitations(currentUser.userId);
    if (!result.ok) {
      setInvitations([]);
      if (!silent) {
        showError(result.message || "Failed to load invitations");
      }
      setIsLoading(false);
      return;
    }

    setInvitations(result.data);
    if (!silent) {
      setIsLoading(false);
    }
  }, [currentUser, showError]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadInvitations();
  }, [loadInvitations]);

  useEffect(() => {
    if (!currentUser?.userId) {
      return undefined;
    }

    // Keep invitation list fresh so new invites appear without reloading the app.
    const intervalId = window.setInterval(() => {
      loadInvitations({ silent: true });
    }, 5000);

    const handleWindowFocus = () => {
      loadInvitations({ silent: true });
    };

    window.addEventListener("focus", handleWindowFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [currentUser?.userId, loadInvitations]);

  const handleInvitationAction = async (invitationId, action) => {
    if (!currentUser?.userId) {
      showError("Missing user information. Please sign in again.");
      return;
    }

    setActiveInvitationId(invitationId);

    const result =
      action === "accept"
        ? await acceptProjectInvitation(invitationId, currentUser.userId)
        : await declineProjectInvitation(invitationId, currentUser.userId);

    if (!result.ok) {
      showError(result.message || "Failed to update invitation");
      setActiveInvitationId(null);
      return;
    }

    showSuccess(action === "accept" ? "Invitation accepted." : "Invitation declined.");
    await Promise.all([reloadProjects({ silent: true }), loadInvitations({ silent: true })]);
    setActiveInvitationId(null);
  };

  const pendingInvitations = invitations.filter((invitation) => invitation.status === "Pending");

  return (
    <section className="workspace-sidebar-panel">
      <div className="workspace-sidebar-panel-header">
        <h3>Invitations</h3>
        <span>{pendingInvitations.length}</span>
      </div>

      {isLoading ? (
        <p className="workspace-info">Loading invitations...</p>
      ) : pendingInvitations.length === 0 ? (
        <p className="workspace-info">No pending invitations.</p>
      ) : (
        <ul className="project-list invitation-list">
          {pendingInvitations.map((invitation) => {
            const isWorking = activeInvitationId === invitation.id;

            return (
              <li key={invitation.id} className="invitation-item">
                <div>
                  <p className="invitation-title">{invitation.projectName}</p>
                  <p className="invitation-meta">
                    Invited by {invitation.invitedByUsername}
                  </p>
                </div>
                <div className="invitation-actions">
                  <button
                    type="button"
                    className="neutral"
                    disabled={isWorking}
                    onClick={() => handleInvitationAction(invitation.id, "decline")}
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    disabled={isWorking}
                    onClick={() => handleInvitationAction(invitation.id, "accept")}
                  >
                    {isWorking ? "Working..." : "Accept"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
