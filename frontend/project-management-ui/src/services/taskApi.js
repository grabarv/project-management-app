const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

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

export async function createProjectTask(projectId, payload, userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks`, {
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
        message: result.message || "Failed to create task",
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

export async function updateTask(taskId, payload, userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
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
        message: result.message || "Failed to update task",
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

export async function deleteTask(taskId, userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: "DELETE",
      headers: withUserHeader(userId),
    });

    if (!response.ok) {
      const result = await parseResponse(response, {});
      return {
        ok: false,
        message: result.message || "Failed to delete task",
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
