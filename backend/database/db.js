

const mongoose = require("mongoose")

async function connectDb(){
   try{
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("DB connected")
  } catch(err){
    console.error("DB connection failed", err)
    process.exit(1)
  }
}
module.exports = { mongoose, connectDb };