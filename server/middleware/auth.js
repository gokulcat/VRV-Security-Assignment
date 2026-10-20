const User = require("../models/User");

let remoteJwks;
let jwksUrl;

async function verifyToken(token) {
  const currentJwksUrl = process.env.NEON_AUTH_JWKS_URL;
  const authBaseUrl = process.env.NEON_AUTH_BASE_URL;
  if (!currentJwksUrl || !authBaseUrl) {
    throw new Error("Neon Auth JWT verification is not configured");
  }

  const { createRemoteJWKSet, jwtVerify } = await import("jose");
  if (!remoteJwks || jwksUrl !== currentJwksUrl) {
    remoteJwks = createRemoteJWKSet(new URL(currentJwksUrl));
    jwksUrl = currentJwksUrl;
  }

  const { payload } = await jwtVerify(token, remoteJwks, {
    issuer: new URL(authBaseUrl).origin,
    algorithms: ["EdDSA"],
  });
  return payload;
}

const authenticate = async (req, res, next) => {
  const authorization = req.headers.authorization;
  const [scheme, token] = authorization ? authorization.split(" ") : [];
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  let identity;
  try {
    identity = await verifyToken(token);
  } catch (error) {
    if (
      error instanceof TypeError ||
      ["ERR_JWKS_TIMEOUT", "ERR_JWKS_INVALID"].includes(error.code)
    ) {
      return next(error);
    }
    return res.status(401).json({ message: "Invalid or expired Neon Auth token" });
  }

  if (
    typeof identity.sub !== "string" ||
    typeof identity.email !== "string"
  ) {
    return res.status(401).json({ message: "Neon Auth token is missing user details" });
  }

  try {
    const profile = await User.syncAuthUser({
      authUserId: identity.sub,
      email: identity.email,
      username:
        typeof identity.name === "string"
          ? identity.name
          : identity.email.split("@")[0],
    });
    if (!profile.is_active) {
      return res.status(403).json({ message: "This account is disabled" });
    }
    req.user = {
      id: profile.id,
      username: profile.username,
      email: profile.email,
      role: profile.role,
      requested_role: profile.requested_role,
      is_active: profile.is_active,
    };
    next();
  } catch (error) {
    next(error);
  }
};

const authorize = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

module.exports = { authenticate, authorize };
