const mongoose = require("../database/db")
const {Schema}= mongoose;

const taskSchema = new Schema({
    
    title:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        required:true,
        trim:true
    },
    deadline:{
        type:Date,
        required:true,
    },

    completed:{
        type:Boolean,
        default:false
    },

   userId:{
  type: Schema.Types.ObjectId,
    ref:"UserCredential",
    required:true
   }
    

},

{timestamps:true}

)

const taskmodel = mongoose.model("taskcredential",taskSchema);
module.exports=taskmodel;