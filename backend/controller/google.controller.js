const usermodel = require("../models/users");
const { invalidateCache } = require('../utils/cache');
const { setAuthCookie, getCryptoKeysPayload, generateToken } = require('../utils/authHelpers');
const generateUniqueUsername = require('../utils/generateUsername');

// GOOGLE AUTH
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
      const username = await generateUniqueUsername(userEmail);

      user = await usermodel.create({
        name: payload.name,
        email: userEmail,
        googleId: payload.sub,
        imageUrl: payload.picture,
        authProvider: "google",
        username: username,
      });

      invalidateCache("leaderboard_full");
    }

    const jwtToken = generateToken(user._id.toString());
    setAuthCookie(res, jwtToken);

    return res.json({
      message: "Login successful",
      isNewUser: isNewUser,
      cryptoKeys: getCryptoKeysPayload(user),
      token: jwtToken
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    return res.status(400).json({
      message: "Google Authentication failed",
    });
  }
};
