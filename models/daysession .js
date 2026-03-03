const {mongoose} = require("../database/db");
const usermodel = require("./users");
const {Schema} = mongoose;

const daysessionSchema = new Schema({

userId:{
    type: Schema.Types.ObjectId,
    ref: "userCredential",
    required:true
},

date:{
    type:Date,
    required:true
},

totalDaytime:{
    type:Number,
    default:0
},

notes: {
    type: String
}

},

{timestamps:true}

)

const dailysessionmodel = mongoose.model("daysessioncreditanils",daysessionSchema);
module.exports = dailysessionmodel;