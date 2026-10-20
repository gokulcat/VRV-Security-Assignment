require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

const pool = require("../db/pool");
const { ensureSchema } = require("../db/schema");
const User = require("../models/User");

async function createAdmin() {
  const { ADMIN_USERNAME = "Gokul", ADMIN_EMAIL, DATABASE_URL } = process.env;

  if (!DATABASE_URL || !ADMIN_EMAIL) {
    throw new Error(
      "Set DATABASE_URL and ADMIN_EMAIL before promoting the administrator account"
    );
  }

  await ensureSchema();
  const promoted = await User.promoteAdmin(ADMIN_EMAIL, ADMIN_USERNAME.trim());
  if (!promoted) {
    throw new Error(
      `No application profile for ${ADMIN_EMAIL}. Register with Neon Auth and sign in once before promoting the account.`
    );
  }

  console.log(`Administrator role granted to ${promoted.email}`);
}

createAdmin()
  .catch((error) => {
    console.error("Failed to create admin account:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
