const usermodel = require("../models/users");
const bcrypt = require("bcrypt");
const { getUserId } = require('../utils/authHelpers');

// GET MY PROFILE
exports.getProfile = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized: User ID missing" });
        const user = await usermodel.findById(userId).select("-password");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// UPDATE MY PROFILE
exports.updateProfile = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { about, name, email, avatar, newPassword } = req.body;

        const updateData = {};
        const existingUser = await usermodel.findById(userId).select("+password");
        if (!existingUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (about !== undefined) updateData.about = about;
        if (name) updateData.name = name;

        if (email && email.toLowerCase() !== existingUser.email) {
            if (!existingUser.password) {
                if (!newPassword) {
                    return res.status(400).json({
                        success: false,
                        requirePasswordSetup: true,
                        message: "Since you signed up with Google, please set a password to change your email."
                    });
                }
                const salt = await bcrypt.genSalt(10);
                updateData.password = await bcrypt.hash(newPassword, salt);
            }
            updateData.email = email.toLowerCase();
        }

        if (avatar) {
            const ALLOWED_AVATARS = [
                "/avatars/gwen.webp",
                "/avatars/spidey.webp",
                "/avatars/buttercup.webp",
                "/avatars/henry.webp",
                "/avatars/gwen.png",
                "/avatars/spidey.png",
                "/avatars/buttercup.png",
                "/avatars/henry.png"
            ];

            if (ALLOWED_AVATARS.includes(avatar) || (avatar.startsWith('https://') && !avatar.includes('<')) || avatar.startsWith('/avatars/')) {
                updateData.imageUrl = avatar;
                updateData.avatar = avatar;
            }
        }

        const user = await usermodel.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            user,
            message: "Profile updated successfully"
        });

    } catch (error) {
        console.error("Profile Update Error:", error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "This email is already registered." });
        }
        res.status(500).json({ success: false, message: "Error updating profile" });
    }
};

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
