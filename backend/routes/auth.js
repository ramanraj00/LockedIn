const express = require("express");
const router = express.Router();

const ratelimit = require("express-rate-limit");
const authController = require("../controller/auth.controller");

const userValidationMiddleware = require("../middleware/uservalidation");
const authMiddleware = require("../middleware/authMiddleware"); // 👈 Ye line add karni zaroori thi!

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

// 🔥 NEW SECURE ROUTE
router.get("/check-auth", authMiddleware, authController.checkAuth);

router.post("/signup",
  userValidationMiddleware(userValidSchema),
  loginLimiter,
  authController.signup
);

router.post("/signin",
  userValidationMiddleware(userloginSchema),
  loginLimiter,
  authController.signin
);

router.post("/forgetPassword",
  userValidationMiddleware(forgetpasswordvalidatorSchemna),
  authController.forgetPassword
);

router.post("/reset-password/:token",
  userValidationMiddleware(resetPasswordSchema),
  authController.resetPassword
);

router.post("/google-auth",
  userValidationMiddleware(googleAuthSchema),
  authController.googleAuth
);

// 🔥 NEW ROUTE FOR PROFILE DATA 🔥
router.get("/me", authMiddleware, authController.getProfile);
// Profile Update Routes
router.put("/profile", authMiddleware, authController.updateProfile);
router.put("/profile/links", authMiddleware, authController.updateLinks);



router.post("/logout", authController.logout);

module.exports = router;