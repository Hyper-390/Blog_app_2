import express from 'express';
import { getUserProfile, updateProfile, searchUsers } from '../controllers/userController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/search', searchUsers);
router.get('/:username', optionalAuth, getUserProfile);
router.put('/profile', authenticateToken, updateProfile);

export default router;