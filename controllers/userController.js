const fs = require('fs');

const friendService = require('../services/friendService');
const { User } = require('../models/index');
const cloudinary = require('../utils/cloundinary');
const createError = require('../utils/createError');

const upload = (path) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(path, (error, result) => {
      if (error) {
        reject(error);
      }
      resolve(result);
    });
  });
};

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
    if (!req.file) {
      createError('Profile is required', 400);
    }
    const result = await cloudinary.upload(req.file.path);
    await User.update(
      { profilePic: result.secure_url },
      { where: { id: req.user.id } }
    );
    fs.unlinkSync(req.file.path);
    res.json({ profilePic: result.secure_url });
  } catch (err) {
    next(err);
  }
};
