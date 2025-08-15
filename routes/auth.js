const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require("jsonwebtoken");
const RefreshToken = require("../models/RefreshToken");
const { generateAccessToken, generateRefreshToken, regenAccessToken } = require("../controllers/auth");

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

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        
        const decoded = jwt.decode(refreshToken);
        await RefreshToken.create({
            token: refreshToken,
            userId: user._id,
            expiresAt: new Date(decoded.exp * 1000) // JWT exp là dạng UNIX timestamp (giây)
        });

        res.json({
            message: "Đăng nhập thành công!!",
            accessToken: accessToken,
            refreshToken: refreshToken,
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

router.post("/refreshtoken", async (req, res) => {
    try{
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(401).json({ message: "Thiếu refresh token" });

        const tokenDoc = await RefreshToken.findOne({ token: refreshToken });
        if (!tokenDoc) return res.status(403).json({ message: "Refresh token không hợp lệ" });

        if (tokenDoc.expiresAt < new Date()) {
            await RefreshToken.deleteOne({ token: refreshToken }); // Xóa token hết hạn
            return res.status(403).json({ message: "Refresh token đã hết hạn" });
        }

        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
            if (err) return res.status(403).json({ message: "Refresh token hết hạn hoặc không hợp lệ" });

            const newAccessToken = regenAccessToken(user);
            res.json({ accessToken: newAccessToken });
        });
    } catch(err){
        res.status(500).json({message: err.message});
    }
    
});

router.post("/logout", async (req, res) => {
    try{
        const { refreshToken } = req.body;
        await RefreshToken.deleteOne({ token: refreshToken });
        res.status(200).json({ message: "Đã đăng xuất" });
    }catch(err){
        res.status(500).json({message: err.message});
    }
});

module.exports = router;