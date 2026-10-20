import { getNeonAuthToken } from "./neonAuth";

const API_BASE_URL = (process.env.REACT_APP_API_URL || "").replace(/\/$/, "");

export async function apiRequest(path, options = {}) {
  const token = await getNeonAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.message || "The request failed");
    error.status = response.status;
    throw error;
  }
  return data;
}

export async function checkNeonFunction() {
  const functionUrl = process.env.REACT_APP_NEON_FUNCTION_HELLO_BASE_URL;
  if (!functionUrl) {
    throw new Error("REACT_APP_NEON_FUNCTION_HELLO_BASE_URL is required");
  }

  const token = await getNeonAuthToken();
  const response = await fetch(functionUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Neon Function health check failed");
  }
  return data;
}
