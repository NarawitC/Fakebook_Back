const { Op } = require('sequelize');

const { Friend, User } = require('../models/index');
const { FRIEND_ACCEPTED, FRIEND_PENDING } = require('../config/constants');

exports.findAcceptedFriend = async (id) => {
  const friends = await Friend.findAll({
    where: {
      status: FRIEND_ACCEPTED,
      [Op.or]: [{ requestToId: id }, { requestFromId: id }],
    },
  });
  const friendsId = friends.map((el) => {
    return el.requestToId === id ? el.requestFromId : el.requestToId;
  });
  //* ถ้าใน where เป็น array จะเป็น in([])
  const users = await User.findAll({
    where: { id: friendsId },
    attributes: { exclude: ['password'] },
  });
  return users;
};

exports.findPendingFriend = async (id) => {
  const friends = await Friend.findAll({
    where: {
      status: FRIEND_PENDING,
      requestToId: id,
    },
    include: {
      model: User,
      as: 'RequestFrom',
      attributes: { exclude: ['password'] },
    },
  });
  return friends.map((el) => {
    return el.RequestFrom;
  });
};

exports.findRequestFriend = async (id) => {
  const friends = await Friend.findAll({
    where: {
      status: FRIEND_PENDING,
      requestFromId: id,
    },
    include: {
      model: User,
      as: 'RequestFrom',
      attributes: { exclude: ['password'] },
    },
  });
  return friends.map((el) => {
    return el.RequestFrom;
  });
};

exports.findUnknown = async (id) => {
  const friends = await Friend.findAll({
    where: {
      [Op.or]: [{ requestToId: id }, { requestFromId: id }],
    },
  });
  const friendsId = friends.map((el) => {
    return el.requestToId === id ? el.requestFromId : el.requestToId;
  });
  friendsId.push(id);
  const users = await User.findAll({
    where: { id: { [Op.notIn]: friendsId } },
    attributes: { exclude: ['password'] },
  });
  return users;
};

exports.findFriendId = async (id) => {
  const friends = await Friend.findAll({
    where: {
      status: FRIEND_ACCEPTED,
      [Op.or]: [{ requestToId: id }, { requestFromId: id }],
    },
  });
  const friendsId = friends.map((el) => {
    return el.requestToId === id ? el.requestFromId : el.requestToId;
  });
  return friendsId;
};
