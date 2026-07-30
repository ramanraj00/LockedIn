const mongoose = require("mongoose");
const User = require("./backend/models/users");
require("dotenv").config({path: "./backend/.env"});

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await User.find({}).lean();
  let nullUsernames = 0;
  for(let u of users) {
    if(u.username === null) nullUsernames++;
  }
  console.log("Users with username=null:", nullUsernames);
  process.exit(0);
}
check();
