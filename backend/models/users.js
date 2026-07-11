const { optional } = require("zod");
const {mongoose} = require("../database/db");
const { required } = require("zod/mini");
const {Schema} = mongoose;

// this is where we get user details 
const userSchema = new Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        lowercase:true
    },
    password:{
        type:String,
        select: false
    },
    publicKey:{
        type:String
    },
    googleId:{
       type:String
    },
    authProvider:{
        type: String,
        enum: ["local", "google"],
        default: "local"
    },
    resetToken:{
        type:String,
        default: undefined
    },
    resetTokenExpiry:{
        type:Date,
         default: undefined
    },
    imageUrl:{
        type:String,
    },
    // 🔥 NEW PROFILE FIELDS ADDED BELOW 🔥
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
    timestamps:true
}
)

const usermodel = mongoose.model("userCredential",userSchema);
module.exports = usermodel;