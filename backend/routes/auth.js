const express = require("express");
const router = express.Router();
const ratelimit = require("express-rate-limit");
const userValidationMiddleware = require("../middleware/uservalidation");
const authMiddleware = require("../middleware/authMiddleware"); 

const { userValidSchema } = require("../validators/user.validator");
const { userloginSchema } = require("../validators/login.validator");
const { forgetpasswordvalidatorSchemna } = require("../validators/forgetemailvalidator");
const { resetPasswordSchema } = require("../validators/resetPasswordvalidator");
const googleAuthSchema = require("../validators/googleauthvalidator");

// --- Import fully split controllers (Max 2 responsibilities per file) ---
const signupController = require("../controller/signup.controller");
const passwordController = require("../controller/password.controller");
const resetPasswordController = require("../controller/resetPassword.controller");
const googleController = require("../controller/google.controller");
const profileController = require("../controller/profile.controller");
const profileLinksController = require("../controller/profileLinks.controller");
const vaultController = require("../controller/vault.controller");
const searchController = require("../controller/search.controller");
const followController = require("../controller/follow.controller");
const notificationController = require("../controller/notification.controller");
const sessionAuthController = require("../controller/sessionAuth.controller");

// --- Rate Limiters ---
const loginLimiter = ratelimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many login attempts",
});

const recoveryLimiter = ratelimit({
  windowMs: 15 * 60 * 1000, 
  max: 5,
  message: { message: "Too many recovery attempts. Try again later." },
});

// --- Auth Routes (signup + signin) ---
router.post("/signup", userValidationMiddleware(userValidSchema), loginLimiter, signupController.signup);
router.post("/signin", userValidationMiddleware(userloginSchema), loginLimiter, signupController.signin);

// --- Password Reset Routes ---
router.post("/forgetPassword", userValidationMiddleware(forgetpasswordvalidatorSchemna), passwordController.forgetPassword);
router.get("/verify-reset-token/:token", passwordController.verifyResetToken);
router.post("/reset-password/:token", userValidationMiddleware(resetPasswordSchema), resetPasswordController.resetPassword);

// --- Google Auth ---
router.post("/google-auth", userValidationMiddleware(googleAuthSchema), googleController.googleAuth);

// --- Vault / Crypto Keys ---
router.post("/setup-keys", authMiddleware, vaultController.setupKeys);
router.post("/reset-vault-keys", authMiddleware, recoveryLimiter, vaultController.resetVaultKeys);

// --- Profile Routes ---
router.get("/me", authMiddleware, profileController.getProfile);
router.put("/profile", authMiddleware, profileController.updateProfile);
router.get("/profile/:id", profileLinksController.getPublicProfile);
router.put("/profile/links", authMiddleware, profileLinksController.updateLinks);

// --- Social Routes (search, follow, notifications) ---
router.get("/search", searchController.searchUsers);
router.post("/follow/:id", authMiddleware, followController.toggleFollow);
router.get("/follow-data/:id", authMiddleware, followController.getFollowData);
router.get("/notifications", authMiddleware, notificationController.getNotifications);
router.put("/notifications/read", authMiddleware, notificationController.markNotificationsRead);

// --- Session Routes (logout, check-auth) ---
router.post("/logout", sessionAuthController.logout);
router.get("/check-auth", authMiddleware, sessionAuthController.checkAuth);

// --- Public Stats (landing page) ---
router.get("/public-stats", async (req, res) => {
  try {
    const User = require("../models/users");
    const Session = require("../models/studysession");

    const [totalUsers, totalSessions] = await Promise.all([
      User.countDocuments(),
      Session.countDocuments()
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalSessions
      }
    });
  } catch (err) {
    console.error("Public stats error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
});

module.exports = router;
