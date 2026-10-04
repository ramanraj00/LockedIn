const usermodel = require("../models/users");

exports.searchUsers = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.status(200).json({ success: true, users: [] });

        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedQuery, 'i');
        const users = await usermodel.find({
            $or: [{ username: regex }, { name: regex }]
        }).select('name username imageUrl avatar _id').limit(5);

        res.status(200).json({ success: true, users });
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ success: false, message: "Error searching users" });
    }
};
