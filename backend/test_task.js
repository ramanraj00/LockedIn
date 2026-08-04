const mongoose = require('mongoose');
const User = require('./models/users');
const DaySession = require('./models/daysession');
const Task = require('./models/tasks');

async function run() {
  try {
    await mongoose.connect("mongodb+srv://ramanrajsingh1111:XpCqJzZrc4dDttO7@cluster0.p71ic4g.mongodb.net/testdb");
    console.log("Connected to MongoDB");

    // 1. Create User
    const user = await User.create({ name: "Test User", email: "test" + Date.now() + "@test.com", password: "123" });
    console.log("Created user", user._id);

    // 2. Create DaySession
    const day = await DaySession.create({
      title: "My Workspace",
      date: new Date(),
      userId: user._id
    });
    console.log("Created DaySession", day._id);

    // 3. Create Task (this mimics what the route does)
    try {
      const task = await Task.create({
        encryptedDescription: "some base64 string",
        encryptedAESKey: "e2e_v2",
        daySessionId: day._id.toString(), // frontend sends it as a string
        userId: user._id.toString(),
      });
      console.log("Created Task!", task._id);
    } catch (err) {
      console.error("FAILED to create task:", err.message);
    }

    process.exit(0);
  } catch (e) {
    console.error("Script Error:", e);
    process.exit(1);
  }
}
run();
