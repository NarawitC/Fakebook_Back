const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const friendService = require('../services/friendService');
const { User } = require('../models/index');

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

exports.updateProfile = async (req, res, next) => {
  try {
    // console.log(req.file);
    cloudinary.uploader.upload(req.file.path, async (error, result) => {
      if (error) {
        return next(error);
      }
      await User.update(
        { profilePic: result.secure_url },
        { where: { id: req.user.id } }
      );
      res.json({ profilePic: result.secure_url });
      fs.unlinkSync(req.file.path);
    });
  } catch (err) {
    next(err);
  }
};
