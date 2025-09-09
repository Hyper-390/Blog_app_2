import { getDatabase } from '../config/database.js';
import { createNotification } from './notificationController.js';

export const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    const db = getDatabase();
    
    // Check if already liked
    db.get(
      'SELECT id FROM likes WHERE userId = ? AND postId = ?',
      [userId, postId],
      (err, existing) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (existing) {
          return res.status(409).json({ error: 'Post already liked' });
        }

        // Get post author
        db.get(
          'SELECT authorId FROM posts WHERE id = ?',
          [postId],
          async (err, post) => {
            if (err || !post) {
              return res.status(404).json({ error: 'Post not found' });
            }

            // Create like
            db.run(
              'INSERT INTO likes (userId, postId) VALUES (?, ?)',
              [userId, postId],
              async function(err) {
                if (err) {
                  return res.status(500).json({ error: 'Error liking post' });
                }

                // Create notification if not self-like
                if (post.authorId !== userId) {
                  await createNotification({
                    recipientId: post.authorId,
                    senderId: userId,
                    type: 'like',
                    postId: postId,
                    message: `${req.user.username} liked your post`
                  }, req.app.get('io'));
                }

                res.json({ message: 'Post liked successfully' });
              }
            );
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const unlikePost = (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    const db = getDatabase();
    
    db.run(
      'DELETE FROM likes WHERE userId = ? AND postId = ?',
      [userId, postId],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Like not found' });
        }

        res.json({ message: 'Post unliked successfully' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getPostLikes = (req, res) => {
  try {
    const { postId } = req.params;
    const db = getDatabase();
    
    db.all(`
      SELECT u.id, u.username, u.profilePicture
      FROM users u
      JOIN likes l ON u.id = l.userId
      WHERE l.postId = ?
      ORDER BY l.createdAt DESC
    `, [postId], (err, likes) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({ likes });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const checkUserLike = (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    const db = getDatabase();
    
    db.get(
      'SELECT id FROM likes WHERE userId = ? AND postId = ?',
      [userId, postId],
      (err, like) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({ isLiked: !!like });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};