const mongoose = require('mongoose');
const User = require('./models/users');
const dailysessionmodel = require('./models/daysession');
const taskmodel = require('./models/tasks');
require('dotenv').config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");
        
        const users = await User.find({}).select("name imageUrl avatar picture badges createdAt").lean();
        console.log("Users:", users.length);
        
        const now = new Date();
        now.setHours(now.getHours() + 5);
        now.setMinutes(now.getMinutes() + 30);
        const today = new Date(now.toISOString().split('T')[0] + "T00:00:00.000Z");
        
        const userIds = users.map(u => u._id);
        
        const todaySessions = await dailysessionmodel.find({ 
            userId: { $in: userIds }, 
            date: today 
        }).select("userId totalDaytime").lean();
        
        console.log("Sessions:", todaySessions.length);
        mongoose.disconnect();
    } catch (e) {
        console.error("ERROR:", e);
        mongoose.disconnect();
    }
}
run();
