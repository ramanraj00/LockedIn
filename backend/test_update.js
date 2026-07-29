const mongoose = require('mongoose');
const User = require('./models/users');
const bcrypt = require('bcrypt');
mongoose.connect('mongodb://localhost:27017/lockedin').then(async () => {
    try {
        const user = await User.findOne({ email: 'karma@gmail.com' }) || await User.findOne({ email: 'tyagi@gmail.com' });
        console.log("Found user:", user ? user.email : 'None');
        if (user) {
            console.log("Has password:", !!user.password);
            console.log("Auth provider:", user.authProvider);
            // Simulate the updateProfile endpoint
            const email = 'chodu@gmail.com';
            const newPassword = 'Chodu420#';
            const updateData = {};
            if (email && email.toLowerCase() !== user.email) {
                if (!user.password) {
                    if (!newPassword) {
                        console.log("Requires password setup");
                        process.exit(1);
                    }
                    const salt = await bcrypt.genSalt(10);
                    updateData.password = await bcrypt.hash(newPassword, salt);
                }
                updateData.email = email.toLowerCase();
            }
            console.log("Update data:", updateData);
            const updatedUser = await User.findByIdAndUpdate(user._id, { $set: updateData }, { new: true, runValidators: true });
            console.log("Updated user email:", updatedUser.email);
        }
    } catch (e) {
        console.error("Error:", e);
    }
    process.exit(0);
});
