exports.getMe = async (req, res, next) => {
  try {
    console.log(req.user);
    res.json({ user: req.user });
  } catch (err) {}
};
