const mongoose = require("mongoose");
const User = require("./models/users");
require("dotenv").config();

async function fixPngToWebp() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB");

    const users = await User.find({}).lean();
    let updatedCount = 0;

    for (let u of users) {
      if (u.imageUrl && u.imageUrl.includes(".png")) {
        const newUrl = u.imageUrl.replace(".png", ".webp");
        await User.updateOne({ _id: u._id }, { $set: { imageUrl: newUrl, avatar: newUrl } });
        updatedCount++;
      } else if (u.avatar && u.avatar.includes(".png")) {
        const newUrl = u.avatar.replace(".png", ".webp");
        await User.updateOne({ _id: u._id }, { $set: { imageUrl: newUrl, avatar: newUrl } });
        updatedCount++;
      }
    }

    console.log(`Successfully fixed ${updatedCount} users from .png to .webp.`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

fixPngToWebp();
