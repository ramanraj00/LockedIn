const usermodel = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const token = req.params.token;
    const { password } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(400).json({ message: "Invalid or Expired token" });
    }

    const user = await usermodel.findById(decoded.id).select("+resetToken +resetTokenExpiry");

    if (!user || user.resetToken !== token) {
      return res.status(400).json({ message: "Invalid token" });
    }

    if (user.resetTokenExpiry < Date.now()) {
      return res.status(400).json({ message: "Token expired" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();
    res.status(201).json({ message: "Login Password reset successful. You can now log in." });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
