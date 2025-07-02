const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next)=>{
    const bearerHeader = req.header("Authorization");
    if(!bearerHeader) return res.status(401).json({message: "Truy cập bị từ chối!!"});

    const token = bearerHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token không hợp lệ!!" });

    try{
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    }catch(err){
        res.status(400).json({message:"Token không hợp lệ!!"});
    }
}
module.exports = verifyToken;