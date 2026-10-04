const usermodel = require("../models/users");
const { getUserId, setAuthCookie, validateCryptoParams, generateToken } = require('../utils/authHelpers');

// SETUP KEYS (Vault Creation)
exports.setupKeys = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { encryptedDEK_pwd, encryptedDEK_rec, userSalt, recoverySalt, pbkdf2Iterations, kdf } = req.body;

        if (!validateCryptoParams({ encryptedDEK_pwd, encryptedDEK_rec, userSalt, recoverySalt, pbkdf2Iterations, kdf })) {
            return res.status(400).json({ message: "Invalid cryptographic parameters." });
        }

        const user = await usermodel.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found." });

        if (user.crypto && user.crypto.encryptedDEK_pwd) {
            return res.status(403).json({ message: "Keys are already set up. Overwriting forbidden." });
        }

        user.crypto = {
            encryptedDEK_pwd,
            encryptedDEK_rec,
            userSalt,
            recoverySalt,
            pbkdf2Iterations,
            kdf: kdf || "PBKDF2",
            vaultVersion: 1,
            lastVaultResetAt: Date.now()
        };

        await user.save();

        const jwtToken = generateToken(user._id.toString());
        setAuthCookie(res, jwtToken);

        res.status(200).json({ message: "Workspace keys securely set up!", token: jwtToken });
    } catch (err) {
        console.error("Setup Keys Error:", err);
        res.status(500).json({ message: "Failed to set up workspace keys", error: err.message });
    }
};

// RESET VAULT KEYS (Recovery Key Flow)
exports.resetVaultKeys = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { encryptedDEK_pwd, encryptedDEK_rec, userSalt, recoverySalt, pbkdf2Iterations, kdf } = req.body;

        if (!validateCryptoParams({ encryptedDEK_pwd, encryptedDEK_rec, userSalt, recoverySalt, pbkdf2Iterations, kdf })) {
            return res.status(400).json({ message: "Invalid cryptographic parameters." });
        }

        const user = await usermodel.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found." });
        if (!user.crypto || !user.crypto.encryptedDEK_pwd) return res.status(400).json({ message: "Vault is not set up yet." });

        user.crypto = {
            encryptedDEK_pwd,
            encryptedDEK_rec,
            userSalt,
            recoverySalt,
            pbkdf2Iterations,
            kdf,
            vaultVersion: (user.crypto.vaultVersion || 1) + 1,
            lastVaultResetAt: Date.now()
        };

        await user.save();
        res.clearCookie("token", { httpOnly: true, sameSite: "none", secure: true });
        res.status(200).json({ message: "Vault reset successfully." });
    } catch (err) {
        console.error("Reset Vault Keys Error:", err);
        res.status(500).json({ message: "Failed to reset workspace keys" });
    }
};
