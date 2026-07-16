const usermodel = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendResetEmail = require("../Services/emailServices");
const { OAuth2Client } = require('google-auth-library');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET missing");
}

// SIGNUP ------------------------------------------------------------------------
exports.signup = async (req, res) => {
  try {
    const { 
        name, password, imageUrl, 
        encryptedDEK_pwd, encryptedDEK_rec, userSalt, 
        recoverySalt, // 🔥 YE WORD MISSING THA, ISKO ADD KARO
        pbkdf2Iterations, kdf 
    } = req.body;
    const email = req.body.email.toLowerCase();
    const existingUser = await usermodel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Unable to create account" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

       const user = await usermodel.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      imageUrl,
      // Save crypto fields
      encryptedDEK_pwd,
      encryptedDEK_rec,
      userSalt,
      recoverySalt, // 🔥 YAHAN BHI ADD KARO TAAKI DB ME SAVE HO
      pbkdf2Iterations,
      kdf
    });

    // Agar frontend Signup ke time crypto keys bhejta hai (Optional, naye UX me ye setupKeys handle karta hai)
    if (encryptedDEK_pwd) {
        user.crypto = {
            encryptedDEK_pwd,
            encryptedDEK_rec,
            userSalt,
            recoverySalt,
            pbkdf2Iterations: pbkdf2Iterations || 250000,
            kdf: kdf || "PBKDF2",
            vaultVersion: 1,
            lastVaultResetAt: Date.now()
        };
    }

    await user.save();
    
    const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
        httpOnly: true,
        secure: false,      
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({ message: "Account created Successfully" });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Error creating account", error: err.message });
  }
};

// SignIn ------------------------------------------------------------------------
exports.signin = async (req, res) => {
  try {
    const { password } = req.body;
    const email = req.body.email.toLowerCase();

    const user = await usermodel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

       return res.json({
        message: "Login Successful",
        cryptoKeys: user.crypto && user.crypto.encryptedDEK_pwd ? {
            encryptedDEK_pwd: user.crypto.encryptedDEK_pwd,
            encryptedDEK_rec: user.crypto.encryptedDEK_rec,
            userSalt: user.crypto.userSalt,
            recoverySalt: user.crypto.recoverySalt,
            pbkdf2Iterations: user.crypto.pbkdf2Iterations,
            kdf: user.crypto.kdf
        } : null
    });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
};

// forgetpassword ----------------------------------------------------------------
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
    await sendResetEmail(email, token);

    return res.json({ message: "If this email exists, reset link has been sent" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Verify Reset Token (Returns Crypto Data for Recovery Key Validation)
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

        // 🔥 FIX: Return Crypto data so frontend can mathematically verify the Recovery Key!
        return res.status(200).json({
            message: "Token is valid",
            // Fallback to handle both old architecture and new architecture
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

// reset password (Only Updates Login Password!)
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

    // Sirf Login Password Update Karo. Vault (cryptoKeys) safe rahega!
    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();
    res.status(201).json({ message: "Login Password reset successful. You can now log in." });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// google auth -------------------------------------------------------------------
exports.googleAuth = async (req, res) => {
  try {
    const token = req.body.token;

    const googleResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!googleResponse.ok) {
        return res.status(400).json({ message: "Invalid Google Token" });
    }

    const payload = await googleResponse.json();
    const userEmail = payload.email.toLowerCase();

    let user = await usermodel.findOne({ email: userEmail });
    let isNewUser = false;
    
    if (!user) {
      isNewUser = true;
      user = await usermodel.create({
        name: payload.name,
        email: userEmail,
        googleId: payload.sub,
        imageUrl: payload.picture,
        authProvider: "google",
      });
    }

    const jwtToken = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // 🔥 FIX 1: maxAge laga diya taaki cookie drop na ho (Same as Email Auth)
    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 Days
    });

       // 🔥 THE FIX: user.crypto ke andar se keys nikalni hain!
    return res.json({
      message: "Login successful",
      isNewUser: isNewUser,
      cryptoKeys: (user.crypto && user.crypto.encryptedDEK_pwd) ? {
          encryptedDEK_pwd: user.crypto.encryptedDEK_pwd,
          encryptedDEK_rec: user.crypto.encryptedDEK_rec,
          userSalt: user.crypto.userSalt,
          recoverySalt: user.crypto.recoverySalt,
          pbkdf2Iterations: user.crypto.pbkdf2Iterations,
          kdf: user.crypto.kdf
      } : null
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    return res.status(400).json({
      message: "Google Authentication failed",
    });
  }
};

// Get Profile Data --------------------------------------------------------------
exports.getProfile = async (req, res) => {
    try {
        const userId = req.userId || (req.user && req.user.id) || req.user;
        if (!userId) return res.status(401).json({ success: false, message: "Unauthorized: User ID missing" });
        const user = await usermodel.findById(userId).select("-password"); 
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.userId || (req.user && req.user.id) || req.user;
        const { about } = req.body;
        const user = await usermodel.findByIdAndUpdate(userId, { about }, { new: true }).select("-password");
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating profile" });
    }
};

exports.updateLinks = async (req, res) => {
    try {
        const userId = req.userId || (req.user && req.user.id) || req.user;
        const { links } = req.body;
        const user = await usermodel.findByIdAndUpdate(userId, { links }, { new: true }).select("-password");
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating links" });
    }
};

exports.logout = (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "lax", secure: false });
  return res.status(200).json({ message: "Logout Successful" });
};

exports.checkAuth = (req, res) => {
    res.status(200).json({ success: true, message: "Authorized" });
};

// 🔥 SETUP KEYS (Vault Creation) 🔥
exports.setupKeys = async (req, res) => {
    try {
        const userId = req.userId || (req.user && req.user.id) || req.user;
        const { encryptedDEK_pwd, encryptedDEK_rec, userSalt, recoverySalt, pbkdf2Iterations, kdf } = req.body;

        // 🔴 Strict Type Validation
        if (
            typeof encryptedDEK_pwd !== "object" ||
            typeof encryptedDEK_rec !== "object" ||
            typeof userSalt !== "string" ||
            typeof recoverySalt !== "string" ||
            !Number.isInteger(pbkdf2Iterations) ||
            pbkdf2Iterations < 100000 ||
            kdf !== "PBKDF2"
        ) {
            return res.status(400).json({ message: "Invalid cryptographic parameters." });
        }

        const user = await usermodel.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found." });

        if (user.crypto && user.crypto.encryptedDEK_pwd) {
            return res.status(403).json({ message: "Keys are already set up. Overwriting forbidden." });
        }

        user.crypto = {
            encryptedDEK_pwd,
            encryptedDEK_rec,
            userSalt,
            recoverySalt,
            pbkdf2Iterations,
            kdf: kdf || "PBKDF2",
            vaultVersion: 1,
            lastVaultResetAt: Date.now() // 🔥 Yahan time update ho gaya
        };

        await user.save();

        // 🚀 THE MAGIC FIX: Naya Token banao taaki Vault ke time se sync ho jaye
        const jwt = require("jsonwebtoken"); // Ensure jwt is imported at top of file, wese hoga hi
        const jwtToken = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        // 🔥 Nayi cookie bhej do jisse browser reload hone par fail na ho
        res.cookie("token", jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 Days
        });

        res.status(200).json({ message: "Workspace keys securely set up!" });
    } catch (err) {
        console.error("Setup Keys Error:", err);
        res.status(500).json({ message: "Failed to set up workspace keys", error: err.message });
    }
}

// 🔥 RESET VAULT KEYS (Recovery Key Flow) 🔥
exports.resetVaultKeys = async (req, res) => {
    try {
        const userId = req.user.id || req.user;
        const { encryptedDEK_pwd, encryptedDEK_rec, userSalt, recoverySalt, pbkdf2Iterations, kdf } = req.body;

        if (
            typeof encryptedDEK_pwd !== "object" ||
            typeof encryptedDEK_rec !== "object" ||
            typeof userSalt !== "string" ||
            typeof recoverySalt !== "string" ||
            !Number.isInteger(pbkdf2Iterations) ||
            pbkdf2Iterations < 100000 ||
            kdf !== "PBKDF2"
        ) {
            return res.status(400).json({ message: "Invalid cryptographic parameters." });
        }

        const user = await usermodel.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found." });
        if (!user.crypto || !user.crypto.encryptedDEK_pwd) return res.status(400).json({ message: "Vault is not set up yet." });

        user.crypto = {
            encryptedDEK_pwd,
            encryptedDEK_rec,
            userSalt,
            recoverySalt,
            pbkdf2Iterations,
            kdf,
            vaultVersion: (user.crypto.vaultVersion || 1) + 1,
            lastVaultResetAt: Date.now()
        };

        await user.save();
        res.clearCookie("token", { httpOnly: true, sameSite: "lax", secure: false }); 
        res.status(200).json({ message: "Vault reset successfully." });
    } catch (err) {
        console.error("Reset Vault Keys Error:", err);
        res.status(500).json({ message: "Failed to reset workspace keys" });
    }
};