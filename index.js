require("dotenv").config();

const express = require("express");

const { connectDb } = require("./database/db");

const authRoutes = require("./routes/auth");

const app = express();

app.use(express.json());

connectDb();

app.use("/api/auth", authRoutes);

app.listen(3000, () => {

  console.log("Server running on port 3000");
  
});