const { mongoose } = require("../database/db");
const { Schema } = mongoose;

// Inside daysession we have task like for monday we have task1,task2,task3...etc

const taskSchema = new Schema(
  {
    daySessionId: {
      type: Schema.Types.ObjectId,
      ref: "daysessioncreditanils",
      required: true,
    },

    encryptedDescription: {
      type: String,
      required: true,
    },

    encryptedAESKey: {
      type: String,
      required: true,
    },

    status: {
      type: Boolean,
      default: false, // false = pending, true = completed
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "userCredential",
      required: true,
    },
  },
  { timestamps: true }
);

// ================= INDEXES =================

// Find all tasks of a day
taskSchema.index({ daySessionId: 1 });

// Find all tasks of a user
taskSchema.index({ userId: 1 });

// Find completed/pending tasks of a user
taskSchema.index({ userId: 1, status: 1 });

// Find tasks of a particular day
taskSchema.index({ daySessionId: 1, status: 1 });

// Most common query: tasks of a user for a particular day
taskSchema.index({ userId: 1, daySessionId: 1 });

// Most optimized for filtering tasks by user + day + status
taskSchema.index({ userId: 1, daySessionId: 1, status: 1 });

const taskmodel = mongoose.model("taskcredential", taskSchema);

module.exports = taskmodel;