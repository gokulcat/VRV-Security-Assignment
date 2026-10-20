import { Pool } from "pg";
import { attachDatabasePool } from "@neon/functions";
import { createRemoteJWKSet, jwtVerify } from "jose";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required by the Neon Function");
}
if (!process.env.NEON_AUTH_JWKS_URL || !process.env.NEON_AUTH_BASE_URL) {
  throw new Error("Neon Auth URLs are required by the Neon Function");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 3,
  idleTimeoutMillis: 30_000,
});
attachDatabasePool(pool);

const jwks = createRemoteJWKSet(new URL(process.env.NEON_AUTH_JWKS_URL));
const issuer = new URL(process.env.NEON_AUTH_BASE_URL).origin;
const allowedOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export default async function health(request: Request): Promise<Response> {
  const origin = request.headers.get("origin");
  const headers = new Headers({ "Content-Type": "application/json" });
  if (origin && allowedOrigins.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Headers", "Authorization");
    headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    headers.set("Vary", "Origin");
  } else if (origin) {
    return Response.json({ message: "Origin is not allowed" }, { status: 403 });
  }

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }
  if (request.method !== "GET") {
    return Response.json({ message: "Method not allowed" }, { status: 405, headers });
  }

  const authorization = request.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) {
    return Response.json({ message: "Authentication required" }, { status: 401, headers });
  }

  try {
    await jwtVerify(authorization.slice(7), jwks, {
      issuer,
      algorithms: ["EdDSA"],
    });
  } catch (error) {
    if (
      error instanceof TypeError ||
      ["ERR_JWKS_TIMEOUT", "ERR_JWKS_INVALID"].includes(error.code)
    ) {
      console.error("Neon Function could not verify the Neon Auth JWKS:", error);
      return Response.json({ message: "Neon Auth verification is unavailable" }, { status: 503, headers });
    }
    return Response.json({ message: "Invalid or expired Neon Auth token" }, { status: 401, headers });
  }

  try {
    await pool.query("SELECT 1");
    return Response.json(
      { ok: true, services: { auth: "connected", postgres: "connected" } },
      { status: 200, headers }
    );
  } catch (error) {
    console.error("Neon Function database health check failed:", error);
    return Response.json({ message: "Database health check failed" }, { status: 503, headers });
  }
}
