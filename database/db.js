const mongoose = require("mongoose")

async function connectDb(){
    mongoose.connect()
}

mongoose.export(
    mongoose,
    connectDb
)