require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const { ensureSchema } = require("./db/schema");
const morgan = require("morgan");

const app = express();
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin is not allowed by CORS"));
    },
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.status(200).send("Welcome to the Role-Based Access Control API!");
});

app.use("/api", async (req, res, next) => {
  try {
    await ensureSchema();
    next();
  } catch (error) {
    next(error);
  }
});

app.use("/api/auth", authRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) {
    return next(error);
  }
  if (error.message === "Origin is not allowed by CORS") {
    return res.status(403).json({ message: error.message });
  }
  const status = Number.isInteger(error.status) ? error.status : 500;
  res.status(status).json({
    message: status < 500 ? error.message : "Internal server error",
  });
});

module.exports = app;
