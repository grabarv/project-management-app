const API_ROOT = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
const API_BASE_URL = `${API_ROOT}/projects`;

async function parseResponse(response, fallback) {
  return response.json().catch(() => fallback);
}

function withUserHeader(userId) {
  return {
    "X-User-Id": String(userId),
  };
}

/**
 * Fetches projects visible to the current user.
 */
export async function fetchProjects(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/`, {
      headers: withUserHeader(userId),
    });
    const result = await parseResponse(response, []);

    if (!response.ok) {
      return {
        ok: false,
        message: result.message || "Failed to load projects",
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
 * Sends a create-project request scoped to the current user.
 */
export async function createProject(payload, userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/`, {
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
        message: result.message || "Failed to create project",
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

export async function updateProject(projectId, payload, userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/${projectId}`, {
      method: "PUT",
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
        message: result.message || "Failed to update project",
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

export async function deleteProject(projectId, userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/${projectId}`, {
      method: "DELETE",
      headers: withUserHeader(userId),
    });

    if (!response.ok) {
      const result = await parseResponse(response, {});
      return {
        ok: false,
        message: result.message || "Failed to delete project",
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: "Network error. Please try again.",
      error,
    };
  }
}

/**
 * Removes a participant from a project and deletes that user's tasks in the project.
 */
export async function removeProjectParticipant(projectId, participantUserId, userId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/${projectId}/participants/${participantUserId}`,
      {
        method: "DELETE",
        headers: withUserHeader(userId),
      }
    );
    const result = await parseResponse(response, {});

    if (!response.ok) {
      return {
        ok: false,
        message: result.message || "Failed to remove participant",
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
