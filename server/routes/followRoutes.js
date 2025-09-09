import express from 'express';
import { 
  followUser, 
  unfollowUser, 
  getFollowers, 
  getFollowing, 
  getSuggestedUsers 
} from '../controllers/followController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/:userId', authenticateToken, followUser);
router.delete('/:userId', authenticateToken, unfollowUser);
router.get('/:userId/followers', getFollowers);
router.get('/:userId/following', getFollowing);
router.get('/suggestions/users', authenticateToken, getSuggestedUsers);

export default router;