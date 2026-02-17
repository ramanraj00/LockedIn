const {mongoose} = require("../database/db")
const {Schema} = mongoose;

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
        required:true
    },

    imageUrl:{
        type:String,
        required:true
    },
},

{
    timestamps:true
}

)

const usermodel = mongoose.model("userCredential",userSchema);
module.exports = usermodel;