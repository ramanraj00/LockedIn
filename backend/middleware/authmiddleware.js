const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
    // Pehle Cookie me dhundo, agar wahan nahi mila tab Authorization Header me dhundo
    const token = req.cookies?.token || (req.headers.authorization && req.headers.authorization.split(" ")[1]);

    if (!token) {
       return res.status(401).json({
            message: "Not authorized. Please login first."
        });
    }

       try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.id; // (Yeh line pehle se hai, isko rehne do taaki purane routes na tutein)
        
        req.user = { id: decoded.id }; // 👈 BAS YEH 1 NAYI LINE ADD KARDO
        
        next(); // Aage route me jaane do
    } catch(err) {
        res.status(403).json({
            message: "Invalid or expired token"
        });
    }
}

module.exports = authMiddleware;