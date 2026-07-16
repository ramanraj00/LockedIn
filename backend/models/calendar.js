const { mongoose } = require("../database/db");
const { Schema } = mongoose;

const calendarEventSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userCredential",
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: String,
        required: true, // Format: YYYY-MM-DD
    },
    color: {
        type: String,
        default: "#3B82F6" // Default Blue
    },
    type: {
        type: String,
        enum: ["normal", "important", "birthday"],
        default: "normal"
    }
}, { timestamps: true });

const CalendarEvent = mongoose.model("CalendarEvent", calendarEventSchema);
module.exports = CalendarEvent;