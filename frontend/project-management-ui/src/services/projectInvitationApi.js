const API_BASE_URL = "https://localhost:5001/api";

function withUserHeader(userId) {
  return {
    "X-User-Id": String(userId),
  };
}

async function parseResponse(response, fallback) {
  return response.json().catch(() => fallback);
}

/**
 * Loads invitations received by the current user.
 */
export async function fetchReceivedProjectInvitations(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/project-invitations/received`, {
      headers: withUserHeader(userId),
    });
    const result = await parseResponse(response, []);

    if (!response.ok) {
      return {
        ok: false,
        message: result.message || "Failed to load invitations",
      };
    }

    return {
      ok: true,
      data: Array.isArray(result) ? result : [],
    };
  } catch (error) {
    return {
      ok: false,
      message: "Network error. Please try again.",
      error,
    };
  }
}

/**
 * Sends a new invitation for a project.
 */
export async function createProjectInvitation(projectId, payload, userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/invitations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...withUserHeader(userId),
      },
      body: JSON.stringify(payload),
    });
    const result = await parseResponse(response, {});

    if (!response.ok) {
      return {
        ok: false,
        message: result.message || "Failed to create invitation",
      };
    }

    return { ok: true, data: result };
  } catch (error) {
    return {
      ok: false,
      message: "Network error. Please try again.",
      error,
    };
  }
}

/**
 * Accepts a received invitation.
 */
export async function acceptProjectInvitation(invitationId, userId) {
  return postInvitationAction(invitationId, "accept", userId);
}

/**
 * Declines a received invitation.
 */
export async function declineProjectInvitation(invitationId, userId) {
  return postInvitationAction(invitationId, "decline", userId);
}

/**
 * Cancels a pending invitation as the project creator.
 */
export async function cancelProjectInvitation(invitationId, userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/project-invitations/${invitationId}`, {
      method: "DELETE",
      headers: withUserHeader(userId),
    });
    const result = await parseResponse(response, {});

    if (!response.ok) {
      return {
        ok: false,
        message: result.message || "Failed to cancel invitation",
      };
    }

    return { ok: true, data: result };
  } catch (error) {
    return {
      ok: false,
      message: "Network error. Please try again.",
      error,
    };
  }
}

async function postInvitationAction(invitationId, action, userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/project-invitations/${invitationId}/${action}`, {
      method: "POST",
      headers: withUserHeader(userId),
    });
    const result = await parseResponse(response, {});

    if (!response.ok) {
      return {
        ok: false,
        message: result.message || "Invitation request failed",
      };
    }

    return { ok: true, data: result };
  } catch (error) {
    return {
      ok: false,
      message: "Network error. Please try again.",
      error,
    };
  }
}
