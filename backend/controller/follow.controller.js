const usermodel = require("../models/users");
const Notification = require('../models/notification');
const { getUserId } = require('../utils/authHelpers');

exports.toggleFollow = async (req, res) => {
    try {
        const currentUserId = getUserId(req);
        const targetUserId = req.params.id;

        if (currentUserId === targetUserId) return res.status(400).json({ success: false, message: "You cannot follow yourself" });

        const currentUser = await usermodel.findById(currentUserId);
        const targetUser = await usermodel.findById(targetUserId);
        if (!targetUser) return res.status(404).json({ success: false, message: "User not found" });

        const isFollowing = currentUser.following.includes(targetUserId);

        if (isFollowing) {
            currentUser.following.pull(targetUserId);
            targetUser.followers.pull(currentUserId);
            await currentUser.save();
            await targetUser.save();
            return res.status(200).json({ success: true, isFollowing: false });
        } else {
            currentUser.following.push(targetUserId);
            targetUser.followers.push(currentUserId);
            await currentUser.save();
            await targetUser.save();

            await Notification.create({ recipient: targetUserId, sender: currentUserId, type: 'follow' });
            return res.status(200).json({ success: true, isFollowing: true });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.getFollowData = async (req, res) => {
    try {
        const user = await usermodel.findById(req.params.id)
            .populate('followers', 'name username imageUrl')
            .populate('following', 'name username imageUrl');
        if (!user) return res.status(404).json({ success: false });
        res.status(200).json({ success: true, followers: user.followers, following: user.following });
    } catch (error) {
        res.status(500).json({ success: false });
    }
};
