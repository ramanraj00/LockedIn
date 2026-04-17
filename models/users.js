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
        select:false
    },

    resetTokenExpiry:{
        type:Date,

    },

    imageUrl:{
        type:String,
    },
},

{
    timestamps:true
}

)

const usermodel = mongoose.model("userCredential",userSchema);
module.exports = usermodel;