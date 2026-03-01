const API_BASE_URL = "https://localhost:5001/api";

async function parseResponse(response, fallback) {
  return response.json().catch(() => fallback);
}

function withUserHeader(userId) {
  return {
    "X-User-Id": String(userId),
  };
}

/**
 * Fetches tasks for a single project visible to the current user.
 */
export async function fetchProjectTasks(projectId, userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks`, {
      headers: withUserHeader(userId),
    });
    const result = await parseResponse(response, []);

    if (!response.ok) {
      return {
        ok: false,
        message: result.message || "Failed to load project tasks",
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

export async function toggleTaskDone(taskId, userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/toggle-done`, {
      method: "POST",
      headers: withUserHeader(userId),
    });
    const result = await parseResponse(response, {});

    if (!response.ok) {
      return {
        ok: false,
        message: result.message || "Failed to update task status",
      };
    }

    return {
      ok: true,
      data: result,
    };
  } catch (error) {
    return {
      ok: false,
      message: "Network error. Please try again.",
      error,
    };
  }
}
