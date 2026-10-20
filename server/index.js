require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

const app = require("./app");
const pool = require("./db/pool");
const { ensureSchema } = require("./db/schema");

const port = Number(process.env.PORT || 5000);

async function start() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }
  if (!process.env.NEON_AUTH_JWKS_URL || !process.env.NEON_AUTH_BASE_URL) {
    throw new Error("Neon Auth URLs are required");
  }

  await ensureSchema();
  const server = app.listen(port, () => {
    console.log(`API server listening on port ${port}`);
  });

  const shutdown = () => {
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

start().catch((error) => {
  console.error("Failed to start API server:", error.message);
  process.exitCode = 1;
});
