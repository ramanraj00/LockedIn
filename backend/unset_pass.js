const mongoose = require('mongoose');
const User = require('./models/users');
mongoose.connect('mongodb+srv://r02519625_db_user:ONU5CZiebxvTOVv2@cluster0.cggwks0.mongodb.net/').then(async () => {
    await User.updateOne({ email: 'chodu@gmail.com' }, { $unset: { password: 1 } });
    console.log("Password unset for chodu@gmail.com");
    process.exit(0);
});
