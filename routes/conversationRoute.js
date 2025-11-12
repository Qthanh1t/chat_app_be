// routes/conversationRoute.js
const express = require('express');
const verifyToken = require('../middlewares/authMiddleware');
const Conversation = require('../models/Conversation');
const mongoose = require('mongoose');
const router = express.Router();

// Tạo một cuộc hội thoại mới (cả 1-1 và nhóm)
router.post('/', verifyToken, async (req, res) => {
    const { participants, type, groupName } = req.body;
    const userId = req.user.id;

    if (!participants || participants.length === 0) {
        return res.status(400).json({ message: "Cần có người tham gia" });
    }

    const allParticipants = [...new Set([...participants, userId])];

    if (type === 'group' && !groupName) {
        return res.status(400).json({ message: "Nhóm phải có tên" });
    }

    // Xử lý cho chat 1-1: Kiểm tra xem conversation đã tồn tại chưa
    if (type === 'private' && allParticipants.length === 2) {
        try {
            const existing = await Conversation.findOne({
                type: 'private',
                participants: { $all: allParticipants }
            });

            if (existing) {
                // SỬA LỖI QUAN TRỌNG Ở ĐÂY:
                // Phải populate trước khi trả về
                const populatedExisting = await existing.populate('participants', 'username avatar');
                return res.status(200).json(populatedExisting);
            }
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    // Tạo conversation mới
    try {
        const newConversation = new Conversation({
            participants: allParticipants,
            type: type || 'private',
            groupName: type === 'group' ? groupName : undefined,
            groupAdmin: type === 'group' ? userId : undefined,
        });

        const savedConversation = await newConversation.save();

        // Populate thông tin người tham gia trước khi gửi về (Luồng này đã đúng)
        const populatedNew = await savedConversation.populate('participants', 'username avatar');

        res.status(201).json(populatedNew);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Lấy TẤT CẢ cuộc hội thoại của user hiện tại
// Đây là route thay thế cho 'GET /conversations' cũ của bạn
router.get('/', verifyToken, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id);

        const conversations = await Conversation.find({ participants: userId })
            .populate('participants', 'username avatar') // Lấy thông tin người tham gia
            .populate('lastMessage') // Lấy tin nhắn cuối cùng
            .sort({ lastMessageAt: -1 }); // Sắp xếp theo tin nhắn mới nhất

        res.json(conversations);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi server" });
    }
});

// (Tự chọn) Thêm/xóa thành viên khỏi nhóm
// router.post('/:conversationId/members', verifyToken, async (req, res) => { ... });
// router.delete('/:conversationId/members', verifyToken, async (req, res) => { ... });

module.exports = router;