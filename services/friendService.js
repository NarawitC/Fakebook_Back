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
