const createError = require('../utils/createError');
const { Friend, User } = require('../models/index');
const { Op } = require('sequelize');
const { FRIEND_ACCEPTED, FRIEND_PENDING } = require('../config/constants');
const friendService = require('../services/friendService');

exports.getAllFriend = async (req, res, next) => {
  try {
    const { status } = req.query;
    let users = [];
    switch (status?.toUpperCase()) {
      case 'UNKNOWN':
        users = await friendService.findUnknown(req.user.id);
        break;
      case 'PENDING':
        users = await friendService.findPendingFriend(req.user.id);
        break;
      case 'REQUESTED':
        users = await friendService.findRequestFriend(req.user.id);
        break;
      default:
        users = await friendService.findAcceptedFriend(req.user.id);
        break;
    }
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

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
