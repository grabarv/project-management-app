const API_BASE_URL = "https://localhost:5001/api/auth";

export async function submitAuthRequest(endpoint, formData) {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        ok: false,
        message: result.message || "Request failed",
      };
    }

    return {
      ok: true,
      data: result,
      message: result.message || "Success",
    };
  } catch (error) {
    return {
      ok: false,
      message: "Network error. Please try again.",
      error,
    };
  }
}
