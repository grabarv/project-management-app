const API_BASE_URL = "https://localhost:5001/api/projects";

async function parseResponse(response, fallback) {
  return response.json().catch(() => fallback);
}

export async function fetchProjects() {
  try {
    const response = await fetch(`${API_BASE_URL}/`);
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

export async function createProject(payload) {
  try {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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

export async function updateProject(projectId, payload) {
  try {
    const response = await fetch(`${API_BASE_URL}/${projectId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
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

export async function deleteProject(projectId) {
  try {
    const response = await fetch(`${API_BASE_URL}/${projectId}`, {
      method: "DELETE",
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
