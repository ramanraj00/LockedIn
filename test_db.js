const mongoose = require('mongoose');
const User = require('./backend/models/users');
mongoose.connect('mongodb://localhost:27017/lockedin');
setTimeout(async () => {
  const users = await User.find({ email: 'chodu@gmail.com' }).select('+password');
  console.log("Users:", users);
  process.exit(0);
}, 1000);
