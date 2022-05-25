const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');

const upload = require('../middlewares/upload');

router.post('/', upload.single('image'), postController.createPost);
router.post('/:postId/like', postController.likePost);
router.delete('/:postId/like', postController.unLikePost);

router.post('/:postId/comments', commentController.createComment);
router.patch('/:postId/comments/:id', commentController.updateComment);
router.delete('/:postId/comments/:id', commentController.deleteComment);

module.exports = router;
