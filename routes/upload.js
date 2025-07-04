const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const verifyToken = require('../middlewares/authMiddleware');

router.post('/', verifyToken, upload.single('image'), (req, res) => {
    if (!req.file) {
    return res.status(400).json({ message: "Không có file được upload." });
  }
  // Nếu upload thành công
    res.json({
        message: 'Upload thành công!',
        file: req.file
    });
});

module.exports = router;