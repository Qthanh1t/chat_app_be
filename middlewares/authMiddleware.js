const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const bearerHeader = req.header("Authorization");
    if (!bearerHeader) return res.status(401).json({ message: "Truy cập bị từ chối!" });

    const token = bearerHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token không hợp lệ!" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Access token hết hạn hoặc không hợp lệ" });
        req.user = user;
        next();
    });
};

module.exports = verifyToken;