const usermodel = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendResetEmail = require("../Services/emailServices");

const JWT_SECRET = process.env.JWT_SECRET;

// FORGET PASSWORD
exports.forgetPassword = async (req, res) => {
  try {
    const email = req.body.email.toLowerCase();
    const user = await usermodel.findOne({ email });

    if (!user) {
      return res.json({ message: "If this email exists, reset link has been sent" });
    }

    const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET, { expiresIn: "10m" });

    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Fire and forget: send email asynchronously
    sendResetEmail(email, token).catch(err => {
      console.error("Background email sending failed:", err);
    });

    return res.json({ message: "If this email exists, reset link has been sent" });
  } catch (error) {
    console.error("Forget password error:", error);
    res.status(500).json({ message: "Something went wrong: " + error.message });
  }
};

// VERIFY RESET TOKEN
exports.verifyResetToken = async (req, res) => {
    try {
        const token = req.params.token;
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

        return res.status(200).json({
            message: "Token is valid",
            encryptedDEK_rec: user.crypto ? user.crypto.encryptedDEK_rec : user.encryptedDEK_rec,
            recoverySalt: user.crypto ? user.crypto.recoverySalt : user.recoverySalt,
            pbkdf2Iterations: user.crypto ? user.crypto.pbkdf2Iterations : user.pbkdf2Iterations,
            kdf: user.crypto ? user.crypto.kdf : user.kdf
        });

    } catch (error) {
        console.error("verifyResetToken Error:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

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
