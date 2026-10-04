const usermodel = require("../models/users");
const bcrypt = require("bcrypt");
const { invalidateCache } = require('../utils/cache');
const { setAuthCookie, getCryptoKeysPayload, generateToken } = require('../utils/authHelpers');
const generateUniqueUsername = require('../utils/generateUsername');

// SIGNUP
exports.signup = async (req, res) => {
  try {
    const {
        name, password, imageUrl,
        encryptedDEK_pwd, encryptedDEK_rec, userSalt,
        recoverySalt,
        pbkdf2Iterations, kdf
    } = req.body;
    const email = req.body.email.toLowerCase();
    const existingUser = await usermodel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Unable to create account" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const username = await generateUniqueUsername(email);

    const user = await usermodel.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      username,
      imageUrl,
      encryptedDEK_pwd,
      encryptedDEK_rec,
      userSalt,
      recoverySalt,
      pbkdf2Iterations,
      kdf
    });

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
    invalidateCache("leaderboard_full");

    const token = generateToken(user._id.toString());
    setAuthCookie(res, token);

    res.status(201).json({
        message: "Account created Successfully",
        token,
        cryptoKeys: getCryptoKeysPayload(user)
    });
  } catch (err) {
    res.status(500).json({ message: "Error creating account", error: err.message });
  }
};

// SIGNIN
exports.signin = async (req, res) => {
  try {
    const { password } = req.body;
    const email = req.body.email.toLowerCase();

    const user = await usermodel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.password) {
      return res.status(400).json({ message: "This account was created via Google. Please log in with Google, or reset your password to create one." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id.toString());
    setAuthCookie(res, token);

    return res.json({
        message: "Login Successful",
        cryptoKeys: getCryptoKeysPayload(user),
        token
    });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
};
