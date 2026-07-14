const { mongoose } = require("../database/db");
const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        select: false
    },
    googleId: {
       type: String
    },
    authProvider: {
        type: String,
        enum: ["local", "google"],
        default: "local"
    },
    resetToken: {
        type: String,
        default: undefined
    },
    resetTokenExpiry: {
        type: Date,
        default: undefined
    },
    imageUrl: {
        type: String,
    },
    
    // 🔥 PROFILE FIELDS 🔥
    about: {
        type: String,
        default: "I am a new user, excited to join LockedIn!"
    },
    links: [{
        platform: { 
            type: String, 
            enum: ['x', 'linkedin', 'youtube', 'instagram', 'medium', 'other'] 
        },
        url: String
    }],
    badges: [{
        name: String,
        imageUrl: String
    }],

    // 🔥 NESTED E2E CRYPTO FIELDS 🔥
    crypto: {
        encryptedDEK_pwd: {
            type: Object, // IV aur Data dono aayenge
        },
        encryptedDEK_rec: {
            type: Object, 
        },
        userSalt: {
            type: String, 
        },
        recoverySalt: {
            type: String, // 16-byte random salt exclusively for Recovery KEK
        },
        pbkdf2Iterations: {
            type: Number,
            default: 250000
        },
        kdf: {
            type: String,
            default: "PBKDF2"
        },
        lastVaultResetAt: {
            type: Date,
            default: Date.now 
        },
        vaultVersion: {
            type: Number,
            default: 1 
        }
    }
},
{
    timestamps: true,
    strict: false
});

const usermodel = mongoose.model("userCredential", userSchema);
module.exports = usermodel;