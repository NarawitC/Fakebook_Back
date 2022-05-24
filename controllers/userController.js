const friendService = require('../services/friendService');
exports.getMe = async (req, res, next) => {
  try {
    const friends = await friendService.findAcceptedFriend(req.user.id);
    const user = JSON.parse(JSON.stringify(req.user));
    user.friends = friends;
    res.json({ user });
  } catch (err) {}
};
