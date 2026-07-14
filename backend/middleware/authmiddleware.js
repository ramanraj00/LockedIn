const jwt = require("jsonwebtoken");
const usermodel = require("../models/users");

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Unauthorized" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await usermodel.findById(decoded.id).select("crypto.lastVaultResetAt");
        if (!user) return res.status(401).json({ message: "User not found" });

        if (user.crypto && user.crypto.lastVaultResetAt) {
            const tokenIssuedAt = decoded.iat * 1000;
            if (tokenIssuedAt < user.crypto.lastVaultResetAt.getTime() - 1000) {
                return res.status(401).json({ message: "Session expired due to security reset. Please log in again." });
            }
        }

        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

module.exports = authMiddleware;