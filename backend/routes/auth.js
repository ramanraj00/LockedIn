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
router.put("/profile", authMiddleware, authController.updateProfile);
router.put("/profile/links", authMiddleware, authController.updateLinks);
router.post("/logout", authController.logout);

module.exports = router;