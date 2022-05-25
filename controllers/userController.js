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
