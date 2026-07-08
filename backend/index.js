require("dotenv").config();
console.log("1");

const express = require("express");
console.log("2");

const helmet = require("helmet");
console.log("3");

const { connectDb } = require("./database/db");
console.log("4");

const authRoute = require("./routes/auth");
console.log("Auth Loaded");

const taskRoute = require("./routes/task");
console.log("Task Loaded");

const sessionRoute = require("./routes/sessions");
console.log("Session Loaded");

const dashboardRoute = require("./routes/dashboards");
console.log("Dashboard Loaded");
const app = express();

console.log("5");

app.use(express.json());

console.log("6 Before DB");
connectDb();
console.log("7 After DB Call");

app.use(helmet());

app.use("/api/auth", authRoute);
app.use("/api/task", taskRoute);
app.use("/api/session", sessionRoute);
app.use("/api/dashboard", dashboardRoute);

app.listen(3000, () => {
  console.log("8 Server running on port 3000");
});