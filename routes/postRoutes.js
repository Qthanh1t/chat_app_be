const express = require('express');
const verifyToken = require('../middlewares/authMiddleware');
const router = express.Router();
const Post = require('../models/Post');
const upload = require('../middlewares/upload');
//tao bai viet
router.post('/posts', verifyToken, upload.array('images'), async (req, res) => {
    try{
        const { content } = req.body;
        // Lấy URL ảnh từ Cloudinary
        const imageUrls = req.files?.map(file => file.path) || [];
        if(!content || content == ""){
            return res.status(400).json({message: "Thiếu nội dung"});
        }
        const post = await Post.create({
            author: req.user.id,
            content,
            images: imageUrls || [],
        });
        res.status(201).json(post);

    } catch(err){
        res.status(500).json({ message: 'Lỗi tạo bài viết', error: err.message });
    }
})
//xem bai viet
router.get('/posts', verifyToken, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username email avatar')
      .populate('comments.user', 'username avatar')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy danh sách bài viết' });
  }
});

//like/unlike
router.put('/like/:id', verifyToken, async (req, res) => {
  try{
    const post = await Post.findById(req.params.id);
    if(!post){
      return res.status(404).json({message: "Bài viết không tồn tại"});
    }
    const index = post.likes.indexOf(req.user.id);
    if(index === -1){
      post.likes.push(req.user.id);
    }
    else{
      post.likes.splice(index, 1);
    }
    await post.save();
    res.json({likes: post.likes});
  }catch(err){
    res.status(500).json({message: "Lỗi like/unlike bài viết", error: err.message});
  }
})

//binh luan 
router.post('/comment/:id', verifyToken, async (req, res) => {
  try{
    const {text} = req.body;
    const post = await  Post.findById(req.params.id);
    if(!post){
      return res.status(404).json({message: "Bài viết không tồn tại"});
    }
    post.comments.push({
      user: req.user.id,
      text,
    })
    await post.save();
    res.json(post.comments);
  }catch(err){
    res.status(500).json({message: "Lỗi bình luận", error: err.message});
  }
})


module.exports = router;