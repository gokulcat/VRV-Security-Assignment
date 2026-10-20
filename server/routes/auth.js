const express = require("express");
const { getCurrentUser } = require("../controllers/authController");
const { authenticate, authorize } = require("../middleware/auth");
const router = express.Router();
const User = require("../models/User");

router.get("/me", authenticate, getCurrentUser);

router.patch("/me/role-request", authenticate, async (req, res) => {
  const { requestedRole } = req.body;
  if (!["admin", "user"].includes(requestedRole)) {
    return res.status(400).json({ message: "A valid requested role is required" });
  }

  try {
    const user = await User.setRequestedRole(req.user.id, requestedRole);
    if (!user) {
      return res.status(409).json({
        message: "Administrator access cannot be requested for an existing administrator",
      });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error("Failed to save role request:", error);
    res.status(500).json({ message: "Failed to save role request" });
  }
});

router.get("/admin", authenticate, authorize(["admin"]), (req, res) => {
  res.json({ message: "Welcome Admin" });
});

router.get("/user", authenticate, authorize(["user", "admin"]), (req, res) => {
  res.json({ message: "Welcome User" });
});

router.get("/users", authenticate, authorize(["admin"]), async (req, res) => {
  try {
    const users = await User.listUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

router.patch(
  "/users/:id/role",
  authenticate,
  authorize(["admin"]),
  async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    if (!id || id.length > 255 || !["admin", "user"].includes(role)) {
      return res.status(400).json({ message: "A valid user ID and role are required" });
    }
    if (id === req.user.id && role !== "admin") {
      return res.status(400).json({ message: "You cannot remove your own administrator role" });
    }

    try {
      const result = await User.updateRole(id, role);
      if (result.status === "not_found") {
        return res.status(404).json({ message: "User profile not found" });
      }
      if (result.status === "last_admin") {
        return res.status(400).json({ message: "The last active administrator cannot be demoted" });
      }
      res.status(200).json({ user: result.user });
    } catch (error) {
      console.error("Failed to update user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  }
);

router.patch(
  "/users/:id/active",
  authenticate,
  authorize(["admin"]),
  async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;
    if (!id || id.length > 255 || typeof isActive !== "boolean") {
      return res.status(400).json({ message: "A valid user ID and active status are required" });
    }
    if (id === req.user.id && !isActive) {
      return res.status(400).json({ message: "You cannot disable your own account" });
    }

    try {
      const result = await User.setUserActive(id, isActive);
      if (result.status === "not_found") {
        return res.status(404).json({ message: "User profile not found" });
      }
      if (result.status === "last_admin") {
        return res.status(400).json({ message: "The last active administrator cannot be disabled" });
      }
      res.status(200).json({ user: result.user });
    } catch (error) {
      console.error("Failed to update user status:", error);
      res.status(500).json({ message: "Failed to update user status" });
    }
  }
);

module.exports = router;
