const mongoose = require('mongoose');
require('dotenv').config();
const DaySession = require('./models/daysession');

async function checkExplain() {
    await mongoose.connect(process.env.MONGODB_URI);
    // Use a random ObjectId for testing explain
    const userId = new mongoose.Types.ObjectId();
    const oneYearAgo = new Date();
    oneYearAgo.setHours(0, 0, 0, 0);
    oneYearAgo.setDate(oneYearAgo.getDate() - 364);

    const pipeline = [
      { 
        $match: { 
          userId: userId, 
          date: { $gte: oneYearAgo } 
        } 
      },
      { 
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalDaytime: { $sum: "$totalDaytime" }
        }
      }
    ];

    try {
        const explainResult = await DaySession.collection.aggregate(pipeline).explain("executionStats");
        console.log(JSON.stringify(explainResult, null, 2));
    } catch (err) {
        console.error("Explain error:", err);
    }
    
    await mongoose.connection.close();
}

checkExplain().catch(console.error);
