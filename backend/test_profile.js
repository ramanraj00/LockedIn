const mongoose = require('mongoose');
const express = require('express');
const supertest = require('supertest');
const dashboardRoute = require('./routes/dashboards');
const User = require('./models/users');

async function run() {
  try {
    await mongoose.connect("mongodb+srv://ramanrajsingh1111:XpCqJzZrc4dDttO7@cluster0.p71ic4g.mongodb.net/testdb");
    console.log("Connected to MongoDB");

    // create a fake user
    const user = await User.create({ name: "Test User", email: "test" + Date.now() + "@test.com", password: "123" });
    console.log("Created user", user._id);

    const req = { user: { id: user._id.toString() } };
    const res = {
      status: function(s) { this.statusCode = s; return this; },
      json: function(j) { console.log("Profile Status:", this.statusCode, "Body:", j); }
    };

    // We can't directly call router in express like this easily without supertest,
    // so let's just extract the logic.
    try {
      const dailysessionmodel = require('./models/daysession');
      const taskmodel = require('./models/tasks');

      const userId = req.user.id;
      const fetchedUser = await User.findById(userId).lean();
      
      const daySessionsWithTasks = await taskmodel.distinct("daySessionId", { userId });
      const studyDays = await dailysessionmodel
        .find({ 
          userId, 
          $or: [
            { totalDaytime: { $gt: 0 } },
            { _id: { $in: daySessionsWithTasks } }
          ]
        })
        .sort({ date: 1 })
        .lean();
        
      console.log("Success. Profile Name:", fetchedUser.name);
    } catch(err) {
      console.log("Error:", err.message);
    }
    
    process.exit(0);
  } catch (e) {
    console.error("Script Error:", e);
    process.exit(1);
  }
}
run();
