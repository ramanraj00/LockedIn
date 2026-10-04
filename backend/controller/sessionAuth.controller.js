const { clearAuthCookie } = require('../utils/authHelpers');

exports.logout = (req, res) => {
    clearAuthCookie(res);
    return res.status(200).json({ message: "Logout Successful" });
};

exports.checkAuth = (req, res) => {
    res.status(200).json({ success: true, message: "Authorized" });
};
