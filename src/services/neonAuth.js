import { createAuthClient } from "@neondatabase/auth";

const authBaseUrl = process.env.REACT_APP_NEON_AUTH_BASE_URL;
let client;

export function getAuthClient() {
  if (!authBaseUrl) {
    throw new Error("REACT_APP_NEON_AUTH_BASE_URL is required");
  }
  if (!client) {
    client = createAuthClient(authBaseUrl, {
      fetchOptions: { credentials: "include" },
    });
  }
  return client;
}

export async function getNeonAuthToken() {
  const authClient = getAuthClient();
  const result = await authClient.token();
  if (result.error) {
    throw new Error(result.error.message || "Could not retrieve an authentication token");
  }
  if (result.data?.token) {
    return result.data.token;
  }

  let sessionToken;
  const sessionResult = await authClient.getSession({
    fetchOptions: {
      onSuccess: ({ response }) => {
        sessionToken = response.headers.get("set-auth-jwt") || undefined;
      },
    },
  });
  if (sessionResult.error) {
    throw new Error(sessionResult.error.message || "Could not retrieve your authentication session");
  }
  if (!sessionResult.data?.session || !sessionResult.data.user || !sessionToken) {
    throw new Error("Could not retrieve an API authentication token. Please sign in again.");
  }

  return sessionToken;
}
