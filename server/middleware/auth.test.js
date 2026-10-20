const assert = require("node:assert/strict");
const http = require("node:http");
const { generateKeyPairSync } = require("node:crypto");
const test = require("node:test");
const User = require("../models/User");
const { authenticate, authorize } = require("./auth");

function createResponse() {
  return {
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
}

test("rejects requests without a Bearer token", async () => {
  const req = { headers: {} };
  const res = createResponse();
  let continued = false;

  await authenticate(req, res, () => {
    continued = true;
  });

  assert.equal(res.statusCode, 401);
  assert.equal(continued, false);
});

test("verifies Neon EdDSA JWTs and attaches the database role", async () => {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  const publicJwk = { ...publicKey.export({ format: "jwk" }), kid: "test-key", alg: "EdDSA" };
  const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ keys: [publicJwk] }));
  });
  const originalSyncAuthUser = User.syncAuthUser;

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const issuer = `http://127.0.0.1:${server.address().port}`;
  process.env.NEON_AUTH_BASE_URL = `${issuer}/test/auth`;
  process.env.NEON_AUTH_JWKS_URL = `${issuer}/jwks`;

  try {
    const { SignJWT } = await import("jose");
    const token = await new SignJWT({
      email: "gokul@example.com",
      name: "Gokul",
    })
      .setProtectedHeader({ alg: "EdDSA", kid: "test-key" })
      .setIssuer(issuer)
      .setSubject("auth-user-1")
      .setIssuedAt()
      .setExpirationTime("5m")
      .sign(privateKey);
    User.syncAuthUser = async (identity) => ({
      id: identity.authUserId,
      username: identity.username,
      email: identity.email,
      role: "admin",
      requested_role: "admin",
      is_active: true,
    });

    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = createResponse();
    let continued = false;

    await authenticate(req, res, () => {
      continued = true;
    });

    assert.equal(continued, true);
    assert.deepEqual(req.user, {
      id: "auth-user-1",
      username: "Gokul",
      email: "gokul@example.com",
      role: "admin",
      requested_role: "admin",
      is_active: true,
    });

    const roleResponse = createResponse();
    let roleContinued = false;
    authorize(["admin"])(req, roleResponse, () => {
      roleContinued = true;
    });
    assert.equal(roleContinued, true);
  } finally {
    User.syncAuthUser = originalSyncAuthUser;
    await new Promise((resolve) => server.close(resolve));
  }
});

test("blocks disabled accounts before role-protected routes", async () => {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  const publicJwk = { ...publicKey.export({ format: "jwk" }), kid: "disabled-key", alg: "EdDSA" };
  const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ keys: [publicJwk] }));
  });
  const originalSyncAuthUser = User.syncAuthUser;

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const issuer = `http://127.0.0.1:${server.address().port}`;
  process.env.NEON_AUTH_BASE_URL = issuer;
  process.env.NEON_AUTH_JWKS_URL = `${issuer}/jwks`;

  try {
    const { SignJWT } = await import("jose");
    const token = await new SignJWT({
      email: "disabled@example.com",
      name: "Disabled",
    })
      .setProtectedHeader({ alg: "EdDSA", kid: "disabled-key" })
      .setIssuer(issuer)
      .setSubject("disabled-user")
      .setIssuedAt()
      .setExpirationTime("5m")
      .sign(privateKey);
    User.syncAuthUser = async () => ({
      id: "disabled-user",
      username: "Disabled",
      email: "disabled@example.com",
      role: "admin",
      is_active: false,
    });

    const res = createResponse();
    await authenticate(
      { headers: { authorization: `Bearer ${token}` } },
      res,
      () => assert.fail("Disabled user must not continue")
    );

    assert.equal(res.statusCode, 403);
  } finally {
    User.syncAuthUser = originalSyncAuthUser;
    await new Promise((resolve) => server.close(resolve));
  }
});
