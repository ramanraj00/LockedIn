require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const { connectDb } = require("./database/db");

const authRoute = require("./routes/auth");
const taskRoute = require("./routes/task");

const app = express();

app.use(express.json());

connectDb();
app.use(helmet());
app.use("/api/auth", authRoute);
app.use("/api/task",taskRoute);

app.listen(3000, () => {

  console.log("Server running on port 3000");
  
});