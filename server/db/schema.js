const pool = require("./pool");

const schemaSql = `
  CREATE TABLE IF NOT EXISTS app_users (
    auth_user_id TEXT PRIMARY KEY,
    username VARCHAR(50) NOT NULL
      CHECK (char_length(btrim(username)) BETWEEN 2 AND 50),
    email VARCHAR(254) NOT NULL UNIQUE,
    role VARCHAR(10) NOT NULL DEFAULT 'user'
      CHECK (role IN ('admin', 'user')),
    requested_role VARCHAR(10) NOT NULL DEFAULT 'user'
      CHECK (requested_role IN ('admin', 'user')),
    role_initialized BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

let schemaReady;

function ensureSchema() {
  if (!process.env.DATABASE_URL) {
    return Promise.reject(new Error("DATABASE_URL is not configured"));
  }

  if (!schemaReady) {
    schemaReady = (async () => {
      await pool.query(schemaSql);
      await pool.query(
        `ALTER TABLE app_users
         ADD COLUMN IF NOT EXISTS requested_role VARCHAR(10) NOT NULL DEFAULT 'user'
         CHECK (requested_role IN ('admin', 'user'))`
      );
      await pool.query(
        `ALTER TABLE app_users
         ADD COLUMN IF NOT EXISTS role_initialized BOOLEAN NOT NULL DEFAULT TRUE`
      );
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }

  return schemaReady;
}

module.exports = { ensureSchema };
