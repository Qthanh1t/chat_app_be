const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const verifyToken = require('../middlewares/authMiddleware');

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

router.post('/login', async (req, res)=>{
    const {email, password} = req.body;

    try{
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: "Email hoặc mật khẩu không đúng!!"});
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if(!validPassword){
            return res.status(400).json({message: "Email hoặc mật khẩu không đúng!!"});
        }

        const token = jwt.sign(
            {id: user._id, username: user.username},
            process.env.JWT_SECRET,
            {expiresIn: '1h'}
        );
        res.json({
            message: "Đăng nhập thành công!!",
            token: token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar:  user.avatar
            }
        });
    } catch(err){
        res.status(500).json({message: err.message});
    }
})

router.get('/friends', verifyToken, async (req, res)=>{
    try{
        const users = await User.find({_id:{$ne: req.user.id}}).select("-password");
        res.json(users);
    }catch(err){
        res.status(500).json({ message: err.message });
    }
})

module.exports = router;