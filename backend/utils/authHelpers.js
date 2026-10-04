const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Sets a secure HTTP-only auth cookie on the response.
 * @param {object} res - Express response object
 * @param {string} token - JWT token
 */
const setAuthCookie = (res, token) => {
    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 Days
    });
};

/**
 * Clears the auth cookie from the response.
 * @param {object} res - Express response object
 */
const clearAuthCookie = (res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
        sameSite: "none",
        secure: true
    });
    res.clearCookie("token", { httpOnly: true, sameSite: "none", secure: true });
};

/**
 * Extracts user ID from the request object (supports multiple auth patterns).
 * @param {object} req - Express request object
 * @returns {string} userId
 */
const getUserId = (req) => {
    return req.userId || (req.user && req.user.id) || req.user;
};

/**
 * Builds the cryptoKeys payload to return in auth responses.
 * @param {object} user - Mongoose user document
 * @returns {object|null} cryptoKeys payload or null
 */
const getCryptoKeysPayload = (user) => {
    if (!user || !user.crypto || !user.crypto.encryptedDEK_pwd) return null;
    return {
        encryptedDEK_pwd: user.crypto.encryptedDEK_pwd,
        encryptedDEK_rec: user.crypto.encryptedDEK_rec,
        userSalt: user.crypto.userSalt,
        recoverySalt: user.crypto.recoverySalt,
        pbkdf2Iterations: user.crypto.pbkdf2Iterations,
        kdf: user.crypto.kdf
    };
};

/**
 * Generates a signed JWT token for a user.
 * @param {string} userId - The user's _id
 * @returns {string} signed JWT
 */
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });
};

/**
 * Validates cryptographic parameters for vault setup/reset.
 * @param {object} params - { encryptedDEK_pwd, encryptedDEK_rec, userSalt, recoverySalt, pbkdf2Iterations, kdf }
 * @returns {boolean} true if valid
 */
const validateCryptoParams = ({ encryptedDEK_pwd, encryptedDEK_rec, userSalt, recoverySalt, pbkdf2Iterations, kdf }) => {
    return (
        typeof encryptedDEK_pwd === "object" &&
        typeof encryptedDEK_rec === "object" &&
        typeof userSalt === "string" &&
        typeof recoverySalt === "string" &&
        Number.isInteger(pbkdf2Iterations) &&
        pbkdf2Iterations >= 100000 &&
        kdf === "PBKDF2"
    );
};

module.exports = {
    setAuthCookie,
    clearAuthCookie,
    getUserId,
    getCryptoKeysPayload,
    generateToken,
    validateCryptoParams
};
