import express from 'express';
import { 
  createPost, 
  getPosts, 
  getPostById, 
  updatePost, 
  deletePost, 
  getUserDrafts 
} from '../controllers/postController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, createPost);
router.get('/', optionalAuth, getPosts);
router.get('/drafts', authenticateToken, getUserDrafts);
router.get('/:id', optionalAuth, getPostById);
router.put('/:id', authenticateToken, updatePost);
router.delete('/:id', authenticateToken, deletePost);

export default router;