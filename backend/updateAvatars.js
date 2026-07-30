const mongoose = require("mongoose");
const User = require("./models/users");
require("dotenv").config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await User.find({}).lean();
  let missingCount = 0;
  for (let u of users) {
    if (!u.imageUrl && !u.avatar && !u.picture) {
      console.log(u.name, "MISSING IMAGE");
      missingCount++;
      await User.updateOne({ _id: u._id }, { $set: { imageUrl: "/avatars/spidey.webp" } });
    } else {
      console.log(u.name, "HAS IMAGE:", u.imageUrl || u.avatar || u.picture);
    }
  }
  console.log(`Updated ${missingCount} users manually.`);
  process.exit(0);
}
run();
