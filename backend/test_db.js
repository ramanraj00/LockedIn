const mongoose = require('mongoose');
require('dotenv').config();
const DaySession = require('./models/daysession');
const User = require('./models/users');

async function test() {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Find latest user
    const users = await User.find().sort({ createdAt: -1 }).limit(1);
    if (!users.length) {
        console.log("No users found");
        return process.exit(0);
    }
    const latestUser = users[0];
    console.log("Latest user:", latestUser._id, latestUser.email);
    
    try {
        const daySessions = await DaySession.find({ userId: latestUser._id }).sort({ date: -1, createdAt: -1 });
        console.log("Day Sessions for latest user:", daySessions.length);
        console.log("JSON Output:");
        console.log(JSON.stringify(daySessions, null, 2));
    } catch (err) {
        console.error("GET /day/all Error:", err);
    }

    // Also check total day sessions
    const total = await DaySession.countDocuments();
    console.log("Total day sessions in DB:", total);
    
    await mongoose.connection.close();
}

test().catch(console.error);
