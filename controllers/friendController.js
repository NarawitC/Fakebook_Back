const createError = require('../utils/createError');
const { Friend } = require('../models/index');
const { Op } = require('sequelize');
const { FRIEND_ACCEPTED, FRIEND_PENDING } = require('../config/constants');

exports.requestFriend = async (req, res, next) => {
  try {
    const { requestToId } = req.body;
    if (req.user.id === +requestToId) {
      createError('Cannot request yourself', 400);
    }
    const existFriend = await Friend.findOne({
      where: {
        [Op.or]: [
          { requestFromId: req.user.id, requestToId: requestToId },
          { requestFromId: requestToId, requestToId: req.user.id },
        ],
      },
    });
    if (existFriend) {
      createError('This user has already been requested', 400);
    }
    const friend = await Friend.create({
      requestToId,
      requestFromId: req.user.id,
      status: FRIEND_PENDING,
    });

    res.json({ friend });
  } catch (err) {
    next(err);
  }
};

exports.updateFriend = async (req, res, next) => {
  try {
    const { requestFromId } = req.params;
    const friend = await Friend.findOne({
      where: {
        requestFromId,
        requestToId: req.user.id,
        status: FRIEND_PENDING,
      },
    });
    if (!friend) {
      createError('Friend request not found', 400);
    }
    friend.status = FRIEND_ACCEPTED;
    await friend.save();
    res.json({ message: 'Friend request accepted' });
  } catch (err) {
    next(err);
  }
};

exports.deleteFriend = async (req, res, next) => {
  try {
    const { id } = req.params;
    const friend = await Friend.findOne({
      where: { id },
    });
    if (!friend) {
      createError('Friend request not found', 400);
    }
    if (
      friend.requestFromId !== req.user.id &&
      friend.requestToId !== req.user.id
    ) {
      createError('You have no permission', 403);
    }
    await friend.destroy();
    res.status(204).json();
  } catch (err) {
    next(err);
  }
};
