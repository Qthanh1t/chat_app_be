const express = require('express');
const verifyToken = require('../middlewares/authMiddleware');
const router = express.Router();
const FriendRequest = require('../models/FriendRequest');
const User = require("../models/User");

//gui loi moi ket ban
router.post('/request/:userId', verifyToken, async (req, res) => {
  const toUserId = req.params.userId;
  const fromUserId = req.user.id;
  try{
    if (fromUserId.toString() === toUserId) {
      return res.status(400).json({ message: "Không thể kết bạn với chính mình." });
    }

    const sender = await User.findById(fromUserId);
    const receiver = await User.findById(toUserId);

    if (!receiver) {
      return res.status(404).json({ message: "Người nhận không tồn tại." });
    }

    const alreadyFriend = sender.friends.includes(toUserId) || receiver.friends.includes(fromUserId);
    if (alreadyFriend) {
      return res.status(400).json({ message: "Hai người đã là bạn bè." });
    }

    const existing = await FriendRequest.findOne({
      $or: [{from: fromUserId, to: toUserId},
        {from: toUserId, to: fromUserId},],
      status: "pending"
    });

    if (existing) {
      return res.status(400).json({ message: "Đã có lời mời cần xử lý." });
    }

    const newRequest = new FriendRequest({ from: fromUserId, to: toUserId });
    await newRequest.save();

    res.json({ message: "Đã gửi lời mời kết bạn." });
  }catch (err){
    res.status(500).json({ message: err.message });
  }
});

//xem danh sach loi moi
router.get('/requests', verifyToken, async (req, res) => {
  try{
    const requests = await FriendRequest.find({
        to: req.user.id,
        status: "pending"
      }).populate('from', 'username avatar');

      res.json(requests);
  }catch (err){
    res.status(500).json({message: err.message});
  }
});

//chap nhan loi moi
router.post('/accept/:requestId', verifyToken, async (req, res) => {
  try{
    const request = await FriendRequest.findById(req.params.requestId);
    if (!request || request.to.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Không có quyền." });
    }
    if(request.status !== "pending"){
      return res.status(403).json({message: "Lời mời đã được chấp nhận hoặc từ chối!"});
    }

    request.status = "accepted";
    await request.save();

    await User.findByIdAndUpdate(request.from, { $addToSet: { friends: request.to } });
    await User.findByIdAndUpdate(request.to, { $addToSet: { friends: request.from } });

    res.json({ message: "Đã chấp nhận lời mời." });
  }catch(err){
    res.status(500).json({message: err.message});
  }
});

//tu choi loi moi
router.post('/decline/:requestId', verifyToken, async (req, res) => {
  try{
    const request = await FriendRequest.findById(req.params.requestId);
    if (!request || request.to.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Không có quyền." });
    }
    if(request.status !== "pending"){
      return res.status(403).json({message: "Lời mời đã được chấp nhận hoặc từ chối!"});
    }

    request.status = "declined";
    await request.save();

    res.json({ message: "Đã từ chối lời mời." });
  }catch(err){
    res.status(500).json({message: err.message});
  }
});

//xoa ban be
router.delete('/remove/:userId', verifyToken, async (req, res) => {
  try{
    const userId = req.user.id;
    const friendId = req.params.userId;

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if ((!user) || (!friend)) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }
    const alreadyFriend = user.friends.includes(friendId) || friend.friends.includes(userId);
    if(!alreadyFriend){
        return res.status(404).json({message: "Người dùng này không phải là bạn bè"});
      }

    await User.findByIdAndUpdate(userId, { $pull: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $pull: { friends: userId } });
    
    res.json({ message: "Đã hủy kết bạn." });
  }catch(err){
    res.status(500).json({message: err.message});
  }
});

//danh sach ban be
router.get('/list', verifyToken, async (req, res) => {
  try{
    const user = await User.findById(req.user.id).populate('friends', 'username avatar');
    res.json(user.friends);
  }catch(err){
    res.status(500).json({message: err.message});
  }
});

// tim kiem ban be
router.get('/search', verifyToken, async (req, res) => {
  try {
    const query = req.query.query?.trim();
    if (!query) return res.status(400).json({ message: 'Thiếu từ khóa tìm kiếm' });

    const currentUserId = req.user._id;

    // Tìm các user phù hợp, loại trừ chính mình
    const users = await User.find({
      _id: { $ne: currentUserId }, // loại chính mình
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).limit(20).select('_id username email avatar');

    res.json(users);
  } catch (err) {
    console.error('Lỗi search:', err);
    res.status(500).json({ message: 'Lỗi server khi tìm kiếm người dùng' });
  }
});

module.exports = router;