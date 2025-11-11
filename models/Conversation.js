const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [
        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
    ],
    type: {
        type: String,
        enum: ['private', 'group'], // 'private' cho 1-1, 'group' cho nhóm
        default: 'private'
    },
    groupName: { type: String, trim: true }, // Chỉ dùng khi type='group'
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Chỉ dùng khi type='group'

    // Lưu tin nhắn cuối cùng để hiển thị ở list-chat cho tiện
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    lastMessageAt: { type: Date, default: Date.now } // Giúp sắp xếp danh sách hội thoại
}, { timestamps: true });

module.exports = mongoose.model("Conversation", conversationSchema);