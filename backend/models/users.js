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
    // 🔥 NAYE E2E CRYPTO FIELDS 🔥
    encryptedDEK_pwd: {
        type: Object, // 👈 Isko Object karna hai kyunki IV aur Data dono aayenge
    },
    encryptedDEK_rec: {
        type: Object, // 👈 Isko bhi Object
    },
    userSalt: {
        type: String, // Ye string hi rahega kyunki ye sirf text hai
    },
    pbkdf2Iterations: {
        type: Number,
        default: 250000
    },
    kdf: {
        type: String,
        default: "PBKDF2"
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
    }]
},
{
    timestamps: true,

    strict: false
});

const usermodel = mongoose.model("userCredential", userSchema);
module.exports = usermodel;