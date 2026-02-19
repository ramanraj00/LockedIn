const { mongoose } = require("../database/db");
const {Schema} = mongoose;

const sessionSchema = new Schema ({

    taskId:{
       type: Schema.Types.ObjectId,
        ref:"taskcredential",
        required:true
    },

    userId:{
       type: Schema.Types.ObjectId,
        ref:"userCredential",
        required:true
    },

    startTime:{
        type:Date,
        required:true
    },
    endTime:{
        type:Date,
        required:true
    },

    duration:{
        type:Number
    },
    status:{
        type:String,
        enum:["running","paused","completed"],
        default:"running"
    }

})

const sessionmodel = mongoose.model("sessioncrediantials",sessionSchema);
module.exports = sessionmodel;