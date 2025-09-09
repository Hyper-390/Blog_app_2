import { getDatabase } from '../config/database.js';
import { createNotification } from './notificationController.js';

export const followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;
    
    if (followerId == userId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const db = getDatabase();
    
    // Check if already following
    db.get(
      'SELECT id FROM follows WHERE followerId = ? AND followingId = ?',
      [followerId, userId],
      (err, existing) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (existing) {
          return res.status(409).json({ error: 'Already following this user' });
        }

        // Create follow relationship
        db.run(
          'INSERT INTO follows (followerId, followingId) VALUES (?, ?)',
          [followerId, userId],
          async function(err) {
            if (err) {
              return res.status(500).json({ error: 'Error following user' });
            }

            // Create notification
            await createNotification({
              recipientId: userId,
              senderId: followerId,
              type: 'follow',
              message: `${req.user.username} started following you`
            }, req.app.get('io'));

            res.json({ message: 'User followed successfully' });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const unfollowUser = (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id;
    const db = getDatabase();
    
    db.run(
      'DELETE FROM follows WHERE followerId = ? AND followingId = ?',
      [followerId, userId],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Follow relationship not found' });
        }

        res.json({ message: 'User unfollowed successfully' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getFollowers = (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDatabase();
    
    db.all(`
      SELECT u.id, u.username, u.profilePicture, u.bio
      FROM users u
      JOIN follows f ON u.id = f.followerId
      WHERE f.followingId = ?
      ORDER BY f.createdAt DESC
    `, [userId], (err, followers) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({ followers });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getFollowing = (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDatabase();
    
    db.all(`
      SELECT u.id, u.username, u.profilePicture, u.bio
      FROM users u
      JOIN follows f ON u.id = f.followingId
      WHERE f.followerId = ?
      ORDER BY f.createdAt DESC
    `, [userId], (err, following) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({ following });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getSuggestedUsers = (req, res) => {
  try {
    const db = getDatabase();
    
    db.all(`
      SELECT u.id, u.username, u.profilePicture, u.bio,
             COUNT(DISTINCT f.id) as followersCount
      FROM users u
      LEFT JOIN follows f ON u.id = f.followingId
      WHERE u.id != ? 
        AND u.id NOT IN (
          SELECT followingId FROM follows WHERE followerId = ?
        )
      GROUP BY u.id
      ORDER BY followersCount DESC, u.createdAt ASC
      LIMIT 5
    `, [req.user.id, req.user.id], (err, users) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const formattedUsers = users.map(user => ({
        ...user,
        followersCount: parseInt(user.followersCount)
      }));

      res.json({ users: formattedUsers });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};