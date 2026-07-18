const { mongoose } = require("../database/db");
const { Schema } = mongoose;

const daysessionSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    deadline: { type: Date },
    date: { type: Date, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "userCredential", required: true, index: true },
    
    totalDaytime: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 }, // ✅ FIELD SAHI JAGAH LAGA DIYA
    
    status: { type: String, enum: ["active", "completed", "pending"], default: "active" } // Add "pending" so workspace saves work seamlessly
  },
  { timestamps: true }
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

const dailysessionmodel = mongoose.model("daysessioncreditanils", daysessionSchema);
module.exports = dailysessionmodel;