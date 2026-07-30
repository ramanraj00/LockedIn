const mongoose = require("mongoose");
const User = require("./backend/models/users");
require("dotenv").config({path: "./backend/.env"});

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOne({}).lean();
  console.log(user.email);
  process.exit(0);
}
check();
