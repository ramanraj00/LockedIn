require("dotenv").config();

const mongoose = require("mongoose")

async function connectDb(){
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("DB connected")
}

module.exports = { mongoose, connectDb };