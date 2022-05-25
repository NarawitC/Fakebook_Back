const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../middlewares/upload');

router.get('/me', userController.getMe);
router.patch(
  '/',
  upload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 },
  ]),
  userController.updateProfile
);
router.get('/posts', userController.getUserPost);

module.exports = router;
