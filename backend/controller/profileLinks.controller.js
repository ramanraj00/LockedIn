const usermodel = require("../models/users");
const { getUserId } = require('../utils/authHelpers');

// UPDATE LINKS
exports.updateLinks = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { links } = req.body;
        const user = await usermodel.findByIdAndUpdate(userId, { links }, { new: true }).select("-password");
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating links" });
    }
};

// GET PUBLIC PROFILE
exports.getPublicProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        if (!userId || userId.length !== 24) {
            return res.status(400).json({ success: false, message: "Invalid user ID format" });
        }
        const user = await usermodel.findById(userId).select('-password -crypto -recoveryEmail');
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("Error fetching public profile:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
