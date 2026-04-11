const {mongoose} = require("../database/db");
const {Schema} = mongoose;

// this is for 1 day session like for mon, tue, wed...


const daysessionSchema = new Schema({

date: {
  type: Date,
  required: true
},
userId: {
  type: Schema.Types.ObjectId,
  ref: "userCredential",
  required: true
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

);

daysessionSchema.pre("save", function(next) {
  if (this.date) {
    this.date.setHours(0, 0, 0, 0);
  }
  next();
});

daysessionSchema.pre("findOneAndUpdate", function(next) {
  const update = this.getUpdate();
  if (update.date) {
    update.date.setHours(0, 0, 0, 0);
  }
  next();
});


daysessionSchema.index({ userId: 1, date: 1 }, { unique: true });

const dailysessionmodel = mongoose.model("daysessioncreditanils",daysessionSchema);
module.exports = dailysessionmodel;