const { mongoose } = require("../database/db");
const {Schema}= mongoose;

// Inside daysession we have task like for monday we have task1,task2,task3...etc 

const taskSchema = new Schema({
    

   daySessionId :{
        type: Schema.Types.ObjectId,
        ref:"daysessioncreditanils",
        required:true
    },

    description:{
        type:String,
        required:true,
        trim:true
    },

    status:{
        type:Boolean,  
        default:false  // false = pending, true = completed
    },

   userId:{
   type: Schema.Types.ObjectId,
    ref:"userCredential",
    required:true,
    index:true
   }
    
},

{timestamps:true}

)

const taskmodel = mongoose.model("taskcredential",taskSchema);
module.exports=taskmodel;
