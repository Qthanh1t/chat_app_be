const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const verifyToken = require('../middlewares/authMiddleware');

router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    console.log("File nhận được:", req.file);
    if (!req.file) {
      return res.status(400).json({ message: "Không có file được upload." });
    }
    res.json({
      message: 'Upload thành công!',
      file: req.file
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Lỗi upload", error: err.message });
  }
});

module.exports = router;