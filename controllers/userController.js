const fs = require('fs');
const { Op } = require('sequelize');

const friendService = require('../services/friendService');
const { User, Comment, Post, Like, Friend } = require('../models/index');
const cloudinary = require('../utils/cloundinary');
const createError = require('../utils/createError');

exports.getMe = async (req, res, next) => {
  try {
    const friends = await friendService.findAcceptedFriend(req.user.id);
    const user = JSON.parse(JSON.stringify(req.user));
    user.friends = friends;
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({
      where: { id: userId },
      attributes: { exclude: ['password'] },
    });
    if (!user) {
      createError('User not found', 400);
    }
    const result = JSON.parse(JSON.stringify(user));
    const friends = await friendService.findAcceptedFriend(user.id);
    result.friends = friends;
    const friend = await Friend.findOne({
      where: {
        [Op.or]: [
          { requestToId: user.id, requestFromId: req.user.id },
          { requestToId: req.user.id, requestFromId: user.id },
        ],
      },
    });
    result.friendStatus = friend;
    res.json({ user: result });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    //  ------------------------------- cb -------------------------------
    // console.log(req.file);
    // cloudinary.uploader.upload(req.file.path, async (error, result) => {
    //   if (error) {
    //     return next(error);
    //   }
    //   await User.update(
    //     { profilePic: result.secure_url },
    //     { where: { id: req.user.id } }
    //   );
    //   res.json({ profilePic: result.secure_url });
    //   fs.unlinkSync(req.file.path);
    // });
    //  ------------------------------- promise -------------------------------
    if (!req.files) {
      createError('Profile pic or cover photo is required', 400);
    }
    const updateValue = {};
    if (req.files.profilePic) {
      const result = await cloudinary.upload(req.files.profilePic[0].path);
      if (req.user.profilePic) {
        const splitted = req.user.profilePic.split('/');
        const publicId = splitted[splitted.length - 1].split('.')[0];
        await cloudinary.destroy(publicId);
      }
      updateValue.profilePic = result.secure_url;
    }
    if (req.files.coverPhoto) {
      const result = await cloudinary.upload(req.files.coverPhoto[0].path);
      if (req.user.coverPhoto) {
        const splitted = req.user.coverPhoto.split('/');
        const publicId = splitted[splitted.length - 1].split('.')[0];
        await cloudinary.destroy(publicId);
      }
      updateValue.coverPhoto = result.secure_url;
    }
    await User.update(updateValue, { where: { id: req.user.id } });
    res.json(updateValue);
  } catch (err) {
    next(err);
  } finally {
    if (req.files.profilePic) {
      fs.unlinkSync(req.files.profilePic[0].path);
    }
    if (req.files.coverPhoto) {
      fs.unlinkSync(req.files.coverPhoto[0].path);
    }
  }
};

exports.getUserPost = async (req, res, next) => {
  try {
    const userId = await friendService.findFriendId(req.user.id);
    userId.push(req.user.id);
    const posts = await Post.findAll({
      attributes: { exclude: ['userId'] },
      where: { userId },
      order: [['updatedAt', 'DESC']],
      include: [
        {
          model: User,
          attributes: {
            exclude: [
              'password',
              'email',
              'phoneNumber',
              'coverPhoto',
              'createdAt',
            ],
          },
        },
        {
          model: Comment,
          attributes: {
            exclude: ['userId', 'createdAt'],
          },
          include: {
            model: User,
            attributes: {
              exclude: [
                'password',
                'email',
                'phoneNumber',
                'coverPhoto',
                'createdAt',
              ],
            },
          },
        },
        {
          model: Like,
          attributes: { exclude: ['createdAt'] },
          include: {
            model: User,
            attributes: {
              exclude: [
                'password',
                'email',
                'phoneNumber',
                'coverPhoto',
                'createdAt',
              ],
            },
          },
        },
      ],
    });
    res.json({ posts });
  } catch (err) {
    next(err);
  }
};
