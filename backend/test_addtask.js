const mongoose = require('mongoose');


async function run() {
  try {
    await mongoose.connect("mongodb+srv://ramanrajsingh1111:XpCqJzZrc4dDttO7@cluster0.p71ic4g.mongodb.net/testdb");
    
    // Just mock auth
    const authMiddleware = (req, res, next) => { req.user = { id: new mongoose.Types.ObjectId() }; next(); };
    
    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: {
        daySessionId: new mongoose.Types.ObjectId(),
        encryptedDescription: "test",
        encryptedAESKey: "test"
      }
    };
    const res = {
      status: function(s) { this.statusCode = s; return this; },
      json: function(j) { console.log("Status:", this.statusCode, "Body:", j); process.exit(0); }
    };
    
    // Direct call to route logic
    try {
      const taskmodel = require('./models/tasks');
      const task = await taskmodel.create({
        encryptedDescription: req.body.encryptedDescription,
        encryptedAESKey: req.body.encryptedAESKey,
        daySessionId: req.body.daySessionId,
        userId: req.user.id,
      });
      res.status(201).json({ message: "Task Cretaed", task });
    } catch(err) {
      res.status(500).json({ message: "Error creating task", error: err.message });
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
