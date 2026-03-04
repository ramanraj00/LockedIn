const { mongoose } = require("../database/db");
const {Schema}= mongoose;

const taskSchema = new Schema({
    
    title:{
        type:String,
        required:true,
        trim:true
    },

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
    deadline:{
        type:Date,
        required:true,
    },

    status:{
        type:String,  
        enum:["pending","completed"],
        default:"pending"
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
