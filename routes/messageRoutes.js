const express = require('express');
const verifyToken = require('../middlewares/authMiddleware');
const Message = require('../models/Message');
const mongoose = require('mongoose');
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

router.get('/conversations', verifyToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id); 

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: userId },
            { receiverId: userId }
          ]
        }
      },
      {
        $sort: { timestamp: -1 } // sắp xếp trước để $first lấy message mới nhất
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", userId] },
              "$receiverId",
              "$senderId"
            ]
          },
          lastMessage: { $first: "$$ROOT" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $project: {
          _id: 0,
          user: { _id: 1, username: 1, avatar: 1 },
          lastMessage: 1
        }
      },
      {
        $sort: { "lastMessage.timestamp": -1 }
      }
    ]);

    res.json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

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
        .sort({ timestamp: -1 })// new first
        .skip(skip)
        .limit(limit);

        res.json({messages: messages, page, limit});
    } catch(err){
        res.status(500).json({ message: err.message });
    }
})

router.delete('/delete/:messageId', verifyToken, async (req, res) => {
    const deleteMessageId = req.params.messageId;
    try{
        const deletedMessage = await Message.deleteOne({_id: deleteMessageId, senderId: req.user.id});
        if(deletedMessage.deletedCount == 0){
            return res.status(404).json({message: "Message not found!"});
        }
        res.status(200).json({message: "Xóa tin nhắn thành công", id: deleteMessageId});
    }catch(err){
        res.status(500).json({message: err.message});
    }
})

module.exports  = router

