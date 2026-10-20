const pool = require("../db/pool");

async function syncAuthUser({ authUserId, email, username }) {
  const normalizedEmail = email.trim().toLowerCase();
  const candidateUsername = username.trim().slice(0, 50);
  const emailUsername = normalizedEmail.split("@")[0].slice(0, 50);
  const normalizedUsername = candidateUsername.length >= 2
    ? candidateUsername
    : emailUsername.length >= 2
      ? emailUsername
      : "User";
  const result = await pool.query(
    `INSERT INTO app_users (auth_user_id, username, email, role_initialized)
     VALUES ($1, $2, $3, FALSE)
     ON CONFLICT (auth_user_id)
     DO UPDATE SET username = EXCLUDED.username, email = EXCLUDED.email
     RETURNING auth_user_id AS id, username, email, role, requested_role, is_active`,
    [authUserId, normalizedUsername, normalizedEmail]
  );
  return result.rows[0];
}

async function listUsers() {
  const result = await pool.query(
    `SELECT auth_user_id AS id, username, email, role, requested_role, is_active
     FROM app_users
     ORDER BY created_at, email`
  );
  return result.rows;
}

async function setUserRole(authUserId, role) {
  const result = await pool.query(
    `UPDATE app_users
     SET role = $2, requested_role = $2, role_initialized = TRUE
     WHERE auth_user_id = $1 AND role_initialized = FALSE
     RETURNING auth_user_id AS id, username, email, role, requested_role, is_active`,
    [authUserId, role]
  );
  return result.rows[0] || null;
}

async function updateRole(authUserId, role) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock($1)", [731942]);

    const userResult = await client.query(
      `SELECT role, is_active FROM app_users
       WHERE auth_user_id = $1 FOR UPDATE`,
      [authUserId]
    );
    const user = userResult.rows[0];
    if (!user) {
      await client.query("COMMIT");
      return { status: "not_found" };
    }

    if (user.role === "admin" && user.is_active && role !== "admin") {
      const countResult = await client.query(
        `SELECT COUNT(*)::int AS count
         FROM app_users WHERE role = 'admin' AND is_active`
      );
      if (countResult.rows[0].count <= 1) {
        await client.query("COMMIT");
        return { status: "last_admin" };
      }
    }

    const updated = await client.query(
      `UPDATE app_users SET role = $2, requested_role = $2, role_initialized = TRUE
       WHERE auth_user_id = $1
       RETURNING auth_user_id AS id, username, email, role, requested_role, is_active`,
      [authUserId, role]
    );
    await client.query("COMMIT");
    return { status: "updated", user: updated.rows[0] };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function setUserActive(authUserId, isActive) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock($1)", [731942]);

    const userResult = await client.query(
      `SELECT role, is_active FROM app_users
       WHERE auth_user_id = $1 FOR UPDATE`,
      [authUserId]
    );
    const user = userResult.rows[0];
    if (!user) {
      await client.query("COMMIT");
      return { status: "not_found" };
    }

    if (user.role === "admin" && user.is_active && !isActive) {
      const countResult = await client.query(
        `SELECT COUNT(*)::int AS count
         FROM app_users WHERE role = 'admin' AND is_active`
      );
      if (countResult.rows[0].count <= 1) {
        await client.query("COMMIT");
        return { status: "last_admin" };
      }
    }

    const updated = await client.query(
      `UPDATE app_users SET is_active = $2
       WHERE auth_user_id = $1
       RETURNING auth_user_id AS id, username, email, role, requested_role, is_active`,
      [authUserId, isActive]
    );
    await client.query("COMMIT");
    return { status: "updated", user: updated.rows[0] };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function promoteAdmin(email, username) {
  const result = await pool.query(
    `UPDATE app_users
     SET role = 'admin', requested_role = 'admin', role_initialized = TRUE,
         username = COALESCE(NULLIF($2, ''), username)
     WHERE email = $1
     RETURNING auth_user_id, username, email`,
    [email.trim().toLowerCase(), username || ""]
  );
  return result.rows[0] || null;
}

module.exports = {
  syncAuthUser,
  listUsers,
  setUserRole,
  updateRole,
  setUserActive,
  promoteAdmin,
};
