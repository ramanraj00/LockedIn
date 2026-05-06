const { optional } = require("zod");
const { mongoose } = require("../database/db");
const { Schema } = mongoose;

// this is for 1 day session like for mon, tue, wed...

const daysessionSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    
    // mai 10 may takk ess task ko complete kar dunga, aur maine mark uncheck kar rakha hai ,to hum check karengai ki deadline ki date cross ho gayi aur user ka still task jo hai unchecked hai to deadline cross ho gayi hai  

     deadline:{ 
        type:Date,
        required:optional,
    },

    date: {
      type: Date,
      required: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "userCredential",
      required: true,
    },

    totalDaytime: {
      type: Number,
      default: 0,
    },

  
  },

  { timestamps: true },
);

daysessionSchema.pre("save", function (next) {
  if (this.date) {
    this.date.setHours(0, 0, 0, 0);
  }
  next();
});

daysessionSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.date) {
    update.date.setHours(0, 0, 0, 0);
  }
  next();
});

daysessionSchema.index({ userId: 1, date: 1 }, { unique: true });

const dailysessionmodel = mongoose.model(
  "daysessioncreditanils",
  daysessionSchema,
);
module.exports = dailysessionmodel;
