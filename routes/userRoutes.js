const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../middlewares/upload');

router.get('/me', userController.getMe);
router.patch('/', upload.single('profilePic'), userController.updateProfile);

module.exports = router;
