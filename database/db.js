require("dotenv").config();

const mongoose = require("mongoose")

async function connectDb(){
   mongoose.connect(process.env.MONGODB_URI);
}

mongoose.export(
    mongoose,
    connectDb
)