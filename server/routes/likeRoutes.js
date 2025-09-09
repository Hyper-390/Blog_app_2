import express from 'express';
import { likePost, unlikePost, getPostLikes, checkUserLike } from '../controllers/likeController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/posts/:postId', authenticateToken, likePost);
router.delete('/posts/:postId', authenticateToken, unlikePost);
router.get('/posts/:postId', getPostLikes);
router.get('/posts/:postId/check', authenticateToken, checkUserLike);

export default router;