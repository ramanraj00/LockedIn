const usermodel = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendResetEmail = require("../Services/emailServices");
const { OAuth2Client } = require("google-auth-library");

const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_ID = process.env.CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET missing");
}

//  SIGNUP
exports.signup = async (req, res) => {
  try {
    const { name, password, imageUrl } = req.body;
    const email = req.body.email.toLowerCase();

    const existingUser = await usermodel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Unable to create account",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await usermodel.create({
      name,
      email,
      password: hashedPassword,
      imageUrl,
    });

    res.status(201).json({
      message: "Account created Successfully",
    });

  } catch (err) {
    res.status(500).json({
      message: "Error creating account",
      error: err.message,
    });
  }
};
//signin
exports.signin = async (req, res) => {
  try {
    const {password } = req.body;
     const email = req.body.email.toLowerCase();

    const user = await usermodel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: user._id.toString() },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      message: "Login Successful",
    });

  } catch (err) {
    res.status(500).json({
      message: "Login error",
      error: err.message,
    });
  }
};

// forgetpassword

exports.forgetPassword = async (req, res) => {
  try {
    const email = req.body.email.toLowerCase();

    const user = await usermodel.findOne({ email });

    if (!user) {
      return res.json({
        message: "If this email exists, reset link has been sent",
      });
    }

    const token = jwt.sign(
      { id: user._id.toString() },
      JWT_SECRET,
      { expiresIn: "10m" }
    );

    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 10 * 60 * 1000;

    await user.save();

    await sendResetEmail(email, token);

   return res.json({
      message: "If this email exists, reset link has been sent",
    });

  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// reset password 

exports.resetPassword = async (req, res) => {
  try {
    const token = req.params.token;
    const { password } = req.body;

    let decoded;

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(400).json({
        message: "Invalid or Expired token",
      });
    }

    const user = await usermodel.findById(decoded.id);

    if (!user || user.resetToken !== token) {
      return res.status(400).json({
        message: "Invalid token",
      });
    }

    if (user.resetTokenExpiry < Date.now()) {
      return res.status(400).json({
        message: "Token expired",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.status(201).json({
      message: "Password reset successful",
    });

  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// google auth 

exports.googleAuth = async (req, res) => {
  try {

    const token = req.body.token;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();

    let user = await usermodel.findOne({ email: payload.email });

    if (!user) {
      user = await usermodel.create({
        name: payload.name,
        email: payload.email,
        googleId: payload.sub,
        imageUrl: payload.picture,
        authProvider: "google",
      });
    }

    const jwtToken = jwt.sign(
      { id: user._id.toString() },
      JWT_SECRET, {expiresIn:"7d"});

   res.cookie("token", jwtToken, {
  httpOnly: true,
  secure: true,
});


return res.json({
  message: "Login successful",
});


  } catch (error) {
   return res.status(400).json({
      message: "Google Authentication failed",
    });
  }
};