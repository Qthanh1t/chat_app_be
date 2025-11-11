const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", require: true },
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", require: true },
    content: { type: String, require: true },
    type: { type: String, default: "text" }, // text or image
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Message", messageSchema);