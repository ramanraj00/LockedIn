require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const performanceMiddleware = require("./middleware/performance");
const logger = require("./utils/logger");
const { mongoose } = require("./database/db");

const { connectDb } = require("./database/db");

const authRoute = require("./routes/auth");
const taskRoute = require("./routes/task");
const sessionRoute = require("./routes/sessions");
const calendarRoutes = require("./routes/calendar.route");
const dashboardRoute = require("./routes/dashboards");
const leaderboardRoutes = require("./routes/leaderboard.routes.js");

const authMiddleware = require("./middleware/authMiddleware");
const cookieParser = require("cookie-parser");
const app = express();   

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "http://localhost:5173",
    "https://locked-in-five-olive.vercel.app"
  ],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));

app.use(express.json());
app.use(performanceMiddleware);
app.use(cookieParser());
app.use(helmet());

// Apply rate limiting to all /api routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: 'draft-7', 
  legacyHeaders: false,
  message: { message: "Too many requests from this IP, please try again after 15 minutes" }
});
app.use("/api", apiLimiter);

connectDb();

// Health Check Endpoint
app.get("/health", (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  if (isDbConnected) {
    res.status(200).json({ status: "UP", database: "connected" });
  } else {
    res.status(503).json({ status: "DOWN", database: "disconnected" });
  }
});

// Auth routes me hum direct middleware nahi lagate (kyunki signup/login bina middleware ke hote hain)
app.use("/api/auth", authRoute);

// 🔥 Yahan baaki sab me authMiddleware laga diya, ab sabme req.user available hoga!
app.use("/api/task", authMiddleware, taskRoute);
app.use("/api/session", authMiddleware, sessionRoute);
app.use("/api/calendar", authMiddleware, calendarRoutes);
app.use("/api/dashboard", authMiddleware, dashboardRoute);
app.use("/api/leaderboard", authMiddleware, leaderboardRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error("[Global Error Handler]:", err);
  res.status(err.status || 500).json({
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "production" ? "Server Error" : err.message
  });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Graceful Shutdown Logic
const shutdown = () => {
  logger.info("SIGTERM/SIGINT received. Shutting down gracefully...");
  server.close(() => {
    logger.info("HTTP server closed.");
    mongoose.connection.close(false).then(() => {
      logger.info("MongoDB connection closed.");
      process.exit(0);
    });
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);