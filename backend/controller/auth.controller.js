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

//  SIGNUP ------------------------------------------------------------------------
exports.signup = async (req, res) => {
  try {
    const { name, password, imageUrl , publicKey } = req.body;
    const email = req.body.email.toLowerCase();

    
const existingUser = await usermodel.findOne({ email });



if (existingUser) {
  return res.status(400).json({
    message: "Unable to create account",
  });
}

    const hashedPassword = await bcrypt.hash(password, 10);

 const user =  await usermodel.create({
      name,
      email,
      password: hashedPassword,
      publicKey,
      imageUrl
    });

    const token = jwt.sign(
  { id: user._id.toString() },
  JWT_SECRET,
  { expiresIn: "7d" }
);

   res.cookie("token", token, {
    httpOnly: true,
    secure: false,      // development
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
});

res.status(201).json({
    message: "Account created Successfully"
});

  } catch (err) {
    res.status(500).json({
      message: "Error creating account",
      error: err.message,
    });
  }
};
//SignIn------------------------------------------------------------------------
exports.signin = async (req, res) => {
  try {
    const { password } = req.body;
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

    const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET, {
      expiresIn: "7d",
    });

   res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
});

return res.json({
    message: "Login Successful"
});
  } catch (err) {
    res.status(500).json({
      message: "Login error",
      error: err.message,
    });
  }
};

// forgetpassword------------------------------------------------------------------------

exports.forgetPassword = async (req, res) => {
  try {
    const email = req.body.email.toLowerCase();

    const user = await usermodel.findOne({ email });

    if (!user) {
      return res.json({
        message: "If this email exists, reset link has been sent",
      });
    }

    const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET, {
      expiresIn: "10m",
    });

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

// reset password------------------------------------------------------------------------

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

   const user = await usermodel.findById(decoded.id).select("+resetToken +resetTokenExpiry");

    

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

// google auth------------------------------------------------------------------------

exports.googleAuth = async (req, res) => {
  try {
    const token = req.body.token;

    // YAHAN SE CHANGE HAI -------------------
    // Backend Google ki official API ko call karke verify karega
    const googleResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!googleResponse.ok) {
        return res.status(400).json({ message: "Invalid Google Token" });
    }

    const payload = await googleResponse.json();
    // YAHAN TAK CHANGE THA ------------------

    // Iske aage tumhara purana code chalega (jisme `user = await usermodel.findOne({ email: payload.email })` likha hua hai)
    let user = await usermodel.findOne({ email: payload.email });
    
    // ... baaki poora code waisa hi rahega jaisa pehle tha
    if (!user) {
      user = await usermodel.create({
        name: payload.name,
        email: payload.email,
        googleId: payload.sub,
        imageUrl: payload.picture,
        authProvider: "google",
      });
    }

    const jwtToken = jwt.sign({ id: user._id.toString() }, JWT_SECRET, {
      expiresIn: "7d",
    });

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

// Get Profile Data ------------------------------------------------------------------------

exports.getProfile = async (req, res) => {
    try {
        // authMiddleware hamesha token verify karke user ki ID req mein daal deta hai
        // Assuming your authMiddleware sets req.userId or req.user
        const userId = req.userId || (req.user && req.user.id) || req.user;
        
        if (!userId) {
             return res.status(401).json({ success: false, message: "Unauthorized: User ID missing" });
        }

        const user = await usermodel.findById(userId).select("-password"); 
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// UPDATE ABOUT SECTION
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.userId || (req.user && req.user.id) || req.user;
        const { about } = req.body;

        const user = await usermodel.findByIdAndUpdate(
            userId, 
            { about }, 
            { new: true }
        ).select("-password");

        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating profile" });
    }
};

// ADD NEW LINK
exports.addLink = async (req, res) => {
    try {
        const userId = req.userId || (req.user && req.user.id) || req.user;
        const { platform, url } = req.body;

        const user = await usermodel.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Naya link array me add karna
        user.links.push({ platform: platform || "other", url });
        await user.save();

        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error adding link" });
    }
};


// Logout ------------------------------------------------------------------------

exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // Development
  });

  return res.status(200).json({
    message: "Logout Successful",
  });
};

exports.checkAuth = (req, res) => {
    // Agar control yahan tak pahuncha, iska matlab authMiddleware pass ho gaya!
    res.status(200).json({ success: true, message: "Authorized" });
};