const express = require('express');
const verifyToken = require('../middlewares/authMiddleware');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation'); // Import Conversation
const mongoose = require('mongoose');
const router = express.Router();

// Gửi tin nhắn
// Route này sẽ nhận conversationId thay vì receiverId
router.post('/send', verifyToken, async (req, res) => {
    // Thay receiverId bằng conversationId
    const { conversationId, content, type } = req.body;

    if (!conversationId || !content) {
        return res.status(400).json({ message: "Thiếu conversationId hoặc nội dung" });
    }

    try {
        // (Optional) Kiểm tra xem user có trong conversation này không
        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: req.user.id
        });
        if (!conversation) {
            return res.status(403).json({ message: "Không có quyền gửi tin nhắn vào nhóm này" });
        }

        const newMessage = new Message({
            senderId: req.user.id,
            conversationId: conversationId, // Lưu ID conversation
            content,
            type: type || "text"
        });

        await newMessage.save();

        // CẬP NHẬT QUAN TRỌNG:
        // Cập nhật lastMessage trong Conversation
        conversation.lastMessage = newMessage._id;
        conversation.lastMessageAt = newMessage.timestamp;
        await conversation.save();

        // (Socket sẽ xử lý việc gửi real-time, API chỉ cần response 201)
        res.status(201).json(newMessage);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Lấy tin nhắn của một cuộc hội thoại
// Thay :userId bằng :conversationId
router.get('/:conversationId', verifyToken, async (req, res) => {
    const conversationId = req.params.conversationId;
    const userId = req.user.id;

    try {
        // (Optional) Kiểm tra quyền
        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: userId
        });
        if (!conversation) {
            return res.status(403).json({ message: "Không có quyền xem tin nhắn này" });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const messages = await Message.find({ conversationId: conversationId })
            .sort({ timestamp: -1 }) // new first
            .skip(skip)
            .limit(limit)
            .populate('senderId', 'username avatar'); // Lấy info sender

        res.json({ messages: messages.reverse(), page, limit }); // Reverse để hiển thị (cũ trước, mới sau)
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Xóa tin nhắn (vẫn giữ nguyên, logic đã đúng)
router.delete('/delete/:messageId', verifyToken, async (req, res) => {
    const deleteMessageId = req.params.messageId;
    try {
        // Chỉ người gửi mới được xóa
        const deletedMessage = await Message.deleteOne({ _id: deleteMessageId, senderId: req.user.id });
        if (deletedMessage.deletedCount == 0) {
            return res.status(404).json({ message: "Message not found or user not authorized" });
        }
        res.status(200).json({ message: "Xóa tin nhắn thành công", id: deleteMessageId });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;