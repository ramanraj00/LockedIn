const express = require("express");
const router = express.Router();
const ratelimit = require("express-rate-limit");
const authController = require("../controller/auth.controller");
const userValidationMiddleware = require("../middleware/uservalidation");
const authMiddleware = require("../middleware/authMiddleware"); 

const { userValidSchema } = require("../validators/user.validator");
const { userloginSchema } = require("../validators/login.validator");
const { forgetpasswordvalidatorSchemna } = require("../validators/forgetemailvalidator");
const { resetPasswordSchema } = require("../validators/resetPasswordvalidator");
const googleAuthSchema = require("../validators/googleauthvalidator");

const loginLimiter = ratelimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many login attempts",
});

const recoveryLimiter = ratelimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, // 5 attempts per 15 min
  message: { message: "Too many recovery attempts. Try again later." },
});
// Ye route sabse neeche add kar do:
router.post("/reset-vault-keys", authMiddleware, recoveryLimiter, authController.resetVaultKeys);

router.get("/check-auth", authMiddleware, authController.checkAuth);

router.post("/setup-keys", authMiddleware, authController.setupKeys);
router.post("/signup", userValidationMiddleware(userValidSchema), loginLimiter, authController.signup);
router.post("/signin", userValidationMiddleware(userloginSchema), loginLimiter, authController.signin);
router.post("/forgetPassword", userValidationMiddleware(forgetpasswordvalidatorSchemna), authController.forgetPassword);

// 🔥 NEW ROUTE: Frontend yahan se token check karke recovery data fetch karega
router.get("/verify-reset-token/:token", authController.verifyResetToken);

router.post("/reset-password/:token", userValidationMiddleware(resetPasswordSchema), authController.resetPassword);
router.post("/google-auth", userValidationMiddleware(googleAuthSchema), authController.googleAuth);

router.get("/me", authMiddleware, authController.getProfile);

// 👇 YAHI WOH ROUTE HAI JO ERROR FIX KAREGA
router.get("/profile/:id", authController.getPublicProfile);
// 👆

router.get("/search", authController.searchUsers);

router.put("/profile", authMiddleware, authController.updateProfile);
router.put("/profile/links", authMiddleware, authController.updateLinks);
router.post("/logout", authController.logout);
router.post("/follow/:id", authMiddleware, authController.toggleFollow);
router.get("/follow-data/:id", authMiddleware, authController.getFollowData);
router.get("/notifications", authMiddleware, authController.getNotifications);
router.put("/notifications/read", authMiddleware, authController.markNotificationsRead);

// 🌐 PUBLIC: Landing page real stats (no auth required)
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