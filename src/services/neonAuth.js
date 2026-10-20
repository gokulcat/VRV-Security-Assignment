import { createAuthClient } from "@neondatabase/auth";

const authBaseUrl = process.env.REACT_APP_NEON_AUTH_BASE_URL;
let client;

export function getAuthClient() {
  if (!authBaseUrl) {
    throw new Error("REACT_APP_NEON_AUTH_BASE_URL is required");
  }
  if (!client) {
    client = createAuthClient(authBaseUrl);
  }
  return client;
}

export async function getNeonAuthToken() {
  const result = await getAuthClient().token();
  if (result.error) {
    throw new Error(result.error.message || "Could not retrieve an authentication token");
  }
  if (!result.data?.token) {
    throw new Error("Sign in to continue");
  }
  return result.data.token;
}
