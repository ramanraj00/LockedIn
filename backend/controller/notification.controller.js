const Notification = require('../models/notification');
const { getUserId } = require('../utils/authHelpers');

exports.getNotifications = async (req, res) => {
    try {
        const userId = getUserId(req);
        const notifications = await Notification.find({ recipient: userId })
            .populate('sender', 'name username imageUrl')
            .sort({ createdAt: -1 }).limit(20);
        res.status(200).json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ success: false });
    }
};

exports.markNotificationsRead = async (req, res) => {
    try {
        const userId = getUserId(req);
        await Notification.updateMany({ recipient: userId, read: false }, { read: true });
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
};
