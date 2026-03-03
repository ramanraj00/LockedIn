const { mongoose } = require("../database/db");
const {Schema} = mongoose;


// Timer system...

const sessionSchema = new Schema ({

    taskId:{
       type: Schema.Types.ObjectId,
        ref:"taskcredential",
        required:true,
        index:true
    },

    userId:{
       type: Schema.Types.ObjectId,
        ref:"userCredential",
        required:true,
        index:true
    },

    startTime:{
        type:Date,
        required:true
    },
    endTime:{
        type:Date,
    },

    duration:{
        type:Number,
        default:0
    },
    status:{
        type:String,
        enum:["running","paused","completed"],
        default:"running"
    }

},
{timestamps:true}
)

const sessionmodel = mongoose.model("sessioncrediantials",sessionSchema);
module.exports = sessionmodel;