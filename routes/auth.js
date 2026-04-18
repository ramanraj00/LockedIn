const express = require("express");
const router = express.Router();

const ratelimit = require("express-rate-limit");
const authController = require("../controllers/auth.controller");

const userValidationMiddleware = require("../middleware/uservalidation");

const { userValidSchema } = require("../validators/user.validator");
const { userloginSchema } = require("../validators/login.validator");
const { forgetpasswordvalidatorSchemna } = require("../validators/forgetemailvalidator");
const { resetPasswordSchema } = require("../validators/resetPasswordvalidator");
const { googleAuthSchema } = require("../validators/googleauthvalidator");

const loginLimiter = ratelimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts",
});


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

module.exports = router;