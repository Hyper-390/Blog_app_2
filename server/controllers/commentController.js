import { getDatabase } from '../config/database.js';
import { createNotification } from './notificationController.js';

export const createComment = async (req, res) => {
  try {
    const { body, postId, parentId } = req.body;
    
    if (!body || !postId) {
      return res.status(400).json({ error: 'Body and postId are required' });
    }

    const db = getDatabase();
    
    // Get post author
    db.get(
      'SELECT authorId FROM posts WHERE id = ?',
      [postId],
      async (err, post) => {
        if (err || !post) {
          return res.status(404).json({ error: 'Post not found' });
        }

        db.run(
          'INSERT INTO comments (body, authorId, postId, parentId) VALUES (?, ?, ?, ?)',
          [body, req.user.id, postId, parentId || null],
          async function(err) {
            if (err) {
              return res.status(500).json({ error: 'Error creating comment' });
            }

            // Create notification if not self-comment
            if (post.authorId !== req.user.id) {
              await createNotification({
                recipientId: post.authorId,
                senderId: req.user.id,
                type: 'comment',
                postId: postId,
                commentId: this.lastID,
                message: `${req.user.username} commented on your post`
              }, req.app.get('io'));
            }

            res.status(201).json({
              message: 'Comment created successfully',
              comment: {
                id: this.lastID,
                body,
                authorId: req.user.id,
                postId,
                parentId: parentId || null
              }
            });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getComments = (req, res) => {
  try {
    const { postId } = req.params;
    const db = getDatabase();
    
    db.all(`
      SELECT c.*, u.username, u.profilePicture
      FROM comments c
      JOIN users u ON c.authorId = u.id
      WHERE c.postId = ?
      ORDER BY c.createdAt ASC
    `, [postId], (err, comments) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // Organize comments into a tree structure
      const commentMap = {};
      const rootComments = [];
      
      comments.forEach(comment => {
        comment.replies = [];
        commentMap[comment.id] = comment;
        
        if (comment.parentId) {
          if (commentMap[comment.parentId]) {
            commentMap[comment.parentId].replies.push(comment);
          }
        } else {
          rootComments.push(comment);
        }
      });

      res.json({ comments: rootComments });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateComment = (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req.body;
    const db = getDatabase();
    
    // Check if comment exists and user owns it
    db.get(
      'SELECT authorId FROM comments WHERE id = ?',
      [id],
      (err, comment) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (!comment) {
          return res.status(404).json({ error: 'Comment not found' });
        }
        
        if (comment.authorId !== req.user.id) {
          return res.status(403).json({ error: 'Not authorized' });
        }

        db.run(
          'UPDATE comments SET body = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
          [body, id],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Error updating comment' });
            }
            
            res.json({ message: 'Comment updated successfully' });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteComment = (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    // Check if comment exists and user owns it
    db.get(
      'SELECT authorId FROM comments WHERE id = ?',
      [id],
      (err, comment) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (!comment) {
          return res.status(404).json({ error: 'Comment not found' });
        }
        
        if (comment.authorId !== req.user.id) {
          return res.status(403).json({ error: 'Not authorized' });
        }

        db.run('DELETE FROM comments WHERE id = ?', [id], function(err) {
          if (err) {
            return res.status(500).json({ error: 'Error deleting comment' });
          }
          
          res.json({ message: 'Comment deleted successfully' });
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};