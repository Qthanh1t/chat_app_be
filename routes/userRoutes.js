const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const verifyToken = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');

router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post('/register',async (req, res)=>{
    const {username, email, password} = req.body;
    try{
        const existUser = await User.findOne({email});
        if(existUser){
            return res.status(400).json({message: "Email đã tồn tại!!"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });
        await newUser.save();
        res.status(201).json({message:"Đăng ký thành công!!"});

    } catch(err){
        res.status(500).json({message: err.message});
    }
})


router.put('/setavatar', verifyToken, upload.single('image'), async (req, res) => {
    try {    
        if (!req.file) {
            return res.status(400).json({ message: "Không có ảnh được upload." });
        }
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            {avatar: req.file.path},
            {new: true}
        );
        if (!updatedUser) {
            console.log('User not found');
            return;
        }
        res.json({
            message: 'Cập nhật avater thành công!',
            file: req.file
        });
  } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ message: "Lỗi update avatar ", error: err.message });
  }
})

router.put('/changeusername', verifyToken, async (req, res) => {
    try{
        const {newUsername} = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            {username: newUsername},
            {new: true},
        );
        
        if(!updatedUser){
            console.log("User not found!!");
            return res.status(404).json({ error: "Người dùng không tồn tại." });
        }
        res.json({message: "Đổi tên thành công!"});
    } catch (err){
        console.error(err);
        res.status(500).json({error: err.message});
    }
    
})

router.put('/changepassword', verifyToken, async (req, res) => {
    try{
        const {newPassword} = req.body;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            {password: hashedPassword},
            {new: true},
        );
        
        if(!updatedUser){
            console.log("User not found!!");
            return res.status(404).json({ error: "Người dùng không tồn tại." });
        }
        res.json({message: "Đổi mật khẩu thành công!"});
    } catch (err){
        console.error(err);
        res.status(500).json({error: err.message});
    }
    
})

module.exports = router;