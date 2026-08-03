const mongoose = require('mongoose');
require('dotenv').config();
const DaySession = require('./models/daysession');

async function fixIndices() {
    await mongoose.connect(process.env.MONGODB_URI);
    
    try {
        await DaySession.collection.dropIndex("userId_1_date_1");
        console.log("Unique index dropped successfully.");
    } catch (e) {
        console.log("Could not drop index (may not exist):", e.message);
    }

    try {
        // Create a non-unique index to ensure the aggregation pipeline remains fast
        await DaySession.collection.createIndex({ userId: 1, date: 1 });
        console.log("Non-unique index created successfully.");
    } catch (e) {
        console.log("Could not create non-unique index:", e.message);
    }
    
    await mongoose.connection.close();
}

fixIndices().catch(console.error);
