const mongoose = require('mongoose');
const User = require('./models/users');
mongoose.connect('mongodb+srv://r02519625_db_user:ONU5CZiebxvTOVv2@cluster0.cggwks0.mongodb.net/').then(async () => {
    const users = await User.find({email: 'chodu@gmail.com'}).select('+password');
    console.log("Users:", users);
    process.exit(0);
});
