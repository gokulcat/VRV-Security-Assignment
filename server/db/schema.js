const pool = require("./pool");

const schemaSql = `
  CREATE TABLE IF NOT EXISTS app_users (
    auth_user_id TEXT PRIMARY KEY,
    username VARCHAR(50) NOT NULL
      CHECK (char_length(btrim(username)) BETWEEN 2 AND 50),
    email VARCHAR(254) NOT NULL UNIQUE,
    role VARCHAR(10) NOT NULL DEFAULT 'user'
      CHECK (role IN ('admin', 'user')),
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
    schemaReady = pool.query(schemaSql).catch((error) => {
      schemaReady = null;
      throw error;
    });
  }

  return schemaReady;
}

module.exports = { ensureSchema };
