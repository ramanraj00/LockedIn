require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const { connectDb } = require("./database/db");

const authRoute = require("./routes/auth");
const taskRoute = require("./routes/task");
const sessionRoute = require("./routes/sessions");
const dashboardRoute = require("./routes/dashboards");
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

app.use("/api/auth", authRoute);
app.use("/api/task", taskRoute);
app.use("/api/session", sessionRoute);
app.use("/api/dashboard", dashboardRoute);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});