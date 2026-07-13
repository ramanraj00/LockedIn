const { mongoose } = require("../database/db");
const { Schema } = mongoose;

// Timer system for calculating in one day how much hour you spent in one daysession...

const sessionSchema = new Schema(
  {
    daySessionId: {
      type: Schema.Types.ObjectId,
      ref: "daysessioncreditanils",
      required: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "userCredential",
      required: true,
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
    },

    duration: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["running", "paused", "completed"],
      default: "running",
    },
  },
  { timestamps: true }
);

// ================= INDEXES =================

// Find all sessions of a user
sessionSchema.index({ userId: 1 });

// Find all sessions of a day
sessionSchema.index({ daySessionId: 1 });

// Find running session of a user
sessionSchema.index({ userId: 1, status: 1 });

// Find sessions of a user for a particular day
sessionSchema.index({ userId: 1, daySessionId: 1 });

// Best index for Pause / Resume / Complete APIs
sessionSchema.index({ userId: 1, daySessionId: 1, status: 1 });

// Sort sessions by start time
sessionSchema.index({ daySessionId: 1, startTime: 1 });

// ================= MIDDLEWARE =================

sessionSchema.pre("save", function (next) {
  if (this.endTime && this.startTime) {
    this.duration = (this.endTime - this.startTime) / 1000;
  }
  next();
});

const sessionmodel = mongoose.model(
  "sessioncrediantials",
  sessionSchema
);

module.exports = sessionmodel;