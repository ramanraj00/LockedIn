const { mongoose } = require("../database/db");
const {Schema} = mongoose;


// Timer system for calculating in one day how much hour you spent in one daysession...

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
{timestamps:true})

sessionSchema.pre("save", function(next) {
  if (this.endTime && this.startTime) {
    this.duration = (this.endTime - this.startTime) / 1000;
  }
  next();
});

const sessionmodel = mongoose.model("sessioncrediantials",sessionSchema);
module.exports = sessionmodel;