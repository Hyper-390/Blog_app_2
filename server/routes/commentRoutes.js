import express from 'express';
import { createComment, getComments, updateComment, deleteComment } from '../controllers/commentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, createComment);
router.get('/post/:postId', getComments);
router.put('/:id', authenticateToken, updateComment);
router.delete('/:id', authenticateToken, deleteComment);

export default router;