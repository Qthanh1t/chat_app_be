const multer = require('multer');
const path = require('path');
require("dotenv").config();
const { CloudinaryStorage } = require('multer-storage-cloudinary');
//cloud
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

// Cấu hình nơi lưu và tên file
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads', // thư mục trong Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

// Kiểm tra file upload (chỉ cho phép ảnh)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (jpg, jpeg, png)!'), false);
  }
};

// Tạo middleware upload
const upload = multer({ storage, fileFilter });

module.exports = upload;
