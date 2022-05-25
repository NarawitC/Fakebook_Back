const fs = require('fs');

const { Post } = require('../models/index');
const cloudinary = require('../utils/cloundinary');
const createError = require('../utils/createError');

exports.createPost = async (req, res, next) => {
  const file = req.file;
  try {
    const { title } = req.body;

    if (!title && !file) {
      createError('Title or image is required', 400);
    }
    let image;
    if (file) {
      const result = await cloudinary.upload(file.path);
      image = result.secure_url;
    }
    const post = await Post.create({ title, image, userId: req.user.id });
    res.json({ post });
  } catch (err) {
    next(err);
  } finally {
    if (file) {
      fs.unlinkSync(file.path);
    }
  }
};
