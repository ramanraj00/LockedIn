const {mongoose} = require("../database/db")
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
        required:true,
        select: false
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