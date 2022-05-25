const fs = require('fs');

const { Post, Like, sequelize } = require('../models/index');
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

exports.likePost = async (req, res, next) => {
  const transaction = await sequelize.transaction(); //* start transaction
  try {
    const { postId } = req.params;
    const existLike = await Like.findOne({
      where: { postId, userId: req.user.id },
    });
    if (existLike) {
      createError('You already liked this post', 400);
    }
    const post = await Post.findOne({ where: { id: postId } });
    if (!post) {
      createError('Post not found', 400);
    }
    const like = await Like.create(
      { postId, userId: req.user.id },
      { transaction }
    );

    await post.increment('like', { by: 1, transaction });
    await transaction.commit();
    res.json({ like });
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
};

exports.unLikePost = async (req, res, next) => {
  const transaction = await sequelize.transaction(); //* start transaction
  try {
    const { postId } = req.params;
    const liked = await Like.findOne({
      where: { postId, userId: req.user.id },
    });
    if (!liked) {
      createError('You never like this post', 400);
    }
    const post = await Post.findOne({ where: { id: postId } });
    if (!post) {
      createError('Post not found', 400);
    }
    await liked.destroy({ transaction });
    await post.decrement('like', { by: 1, transaction });
    await transaction.commit();
    res.status(204).json();
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
};
