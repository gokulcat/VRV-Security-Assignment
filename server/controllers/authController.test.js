const assert = require("node:assert/strict");
const test = require("node:test");
const { getCurrentUser } = require("./authController");

test("returns the authenticated Neon profile", () => {
  const user = {
    id: "neon-auth-user",
    username: "Gokul",
    email: "gokul@example.com",
    role: "admin",
    is_active: true,
  };
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };

  getCurrentUser({ user }, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { user });
});
