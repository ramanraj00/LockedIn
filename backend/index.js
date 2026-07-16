require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const { connectDb } = require("./database/db");

const authRoute = require("./routes/auth");
const taskRoute = require("./routes/task");
const sessionRoute = require("./routes/sessions");
const dashboardRoute = require("./routes/dashboards");
const calendarRoutes = require("./routes/calendar.route");
const authMiddleware = require("./middleware/authMiddleware");
const cookieParser = require("cookie-parser");
const app = express();   // 

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(helmet());

connectDb();
// Auth routes me hum direct middleware nahi lagate (kyunki signup/login bina middleware ke hote hain)
app.use("/api/auth", authRoute);

// 🔥 Yahan baaki sab me authMiddleware laga diya, ab sabme req.user available hoga!
app.use("/api/task", authMiddleware, taskRoute);
app.use("/api/session", authMiddleware, sessionRoute);
app.use("/api/dashboard", authMiddleware, dashboardRoute);
app.use("/api/calendar", calendarRoutes);
app.listen(3000, () => {
  console.log("Server running on port 3000");
});