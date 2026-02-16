const API_BASE_URL = "https://localhost:5001/api/auth";

export async function submitAuthRequest(endpoint, formData, actionLabel) {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error(`Failed to send ${actionLabel} data`);
    }

    const result = await response.json();
    console.log(`${actionLabel} response:`, result);
  } catch (error) {
    console.error(`${actionLabel} request error:`, error);
  }
}
