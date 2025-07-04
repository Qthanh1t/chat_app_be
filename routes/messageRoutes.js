const express = require('express');
const verifyToken = require('../middlewares/authMiddleware');
const Message = require('../models/Message');
const router = express.Router()

router.post('/send', verifyToken,async (req, res)=>{
    const {receiverId, content, type} = req.body;

    if(!receiverId || !content) return res.status(400).json({ message: "Thiếu người nhận hoặc nội dung" });

    try{
        const newMessage = new Message({
            senderId: req.user.id,
            receiverId,
            content, 
            type: type || "text"
        });
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch(err){
        res.status(500).json({ message: err.message });
    }
})

router.get('/:userId', verifyToken, async (req, res)=>{
    const otherUserId = req.params.userId;

    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const messages = await Message.find({
        $or: [
            { senderId: req.user.id, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: req.user.id }
        ]
        })
        .sort({ timestamp: 1 })
        .skip(skip)
        .limit(limit);

        res.json({messages: messages, page, limit});
    } catch(err){
        res.status(500).json({ message: err.message });
    }
})

module.exports  = router

