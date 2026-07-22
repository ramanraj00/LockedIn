const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'userCredential', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'userCredential', required: true },
    type: { type: String, enum: ['follow'], required: true },
    read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);