const assert = require("node:assert/strict");
const test = require("node:test");
const pool = require("../db/pool");
const User = require("./User");

test("syncAuthUser normalizes Neon identity data and uses parameterized SQL", async () => {
  const originalQuery = pool.query;
  const profile = {
    id: "auth-user-1",
    username: "Gokul",
    email: "gokul@example.com",
    role: "user",
    is_active: true,
  };
  let queryText;
  let queryValues;

  pool.query = async (text, values) => {
    queryText = text;
    queryValues = values;
    return { rows: [profile] };
  };

  try {
    assert.equal(
      await User.syncAuthUser({
        authUserId: "auth-user-1",
        username: " Gokul ",
        email: " GOKUL@example.com ",
      }),
      profile
    );
    assert.match(queryText, /ON CONFLICT \(auth_user_id\)/);
    assert.deepEqual(queryValues, [
      "auth-user-1",
      "Gokul",
      "gokul@example.com",
    ]);
  } finally {
    pool.query = originalQuery;
  }
});

test("syncAuthUser supplies a valid display name when the identity name is too short", async () => {
  const originalQuery = pool.query;
  let queryValues;

  pool.query = async (_text, values) => {
    queryValues = values;
    return { rows: [{}] };
  };

  try {
    await User.syncAuthUser({
      authUserId: "auth-user-2",
      username: "A",
      email: "a@example.com",
    });
    assert.equal(queryValues[1], "User");
  } finally {
    pool.query = originalQuery;
  }
});
