const jwt = require("jsonwebtoken");

// Tạo Access Token (thời gian ngắn)
const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "15m" } // 15 phút
    );
};
// Tạo lại accessToken
const regenAccessToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "15m" } // 15 phút
    );
};

// Tạo Refresh Token (thời gian dài hơn)
const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" } // 7 ngày
    );
};

module.exports = { generateAccessToken,regenAccessToken, generateRefreshToken };
