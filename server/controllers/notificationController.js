import { getDatabase } from '../config/database.js';

export const createNotification = async (notificationData, io) => {
  return new Promise((resolve, reject) => {
    const { recipientId, senderId, type, postId, commentId, message } = notificationData;
    const db = getDatabase();
    
    db.run(
      'INSERT INTO notifications (recipientId, senderId, type, postId, commentId, message) VALUES (?, ?, ?, ?, ?, ?)',
      [recipientId, senderId, type, postId || null, commentId || null, message],
      function(err) {
        if (err) {
          reject(err);
          return;
        }

        const notification = {
          id: this.lastID,
          recipientId,
          senderId,
          type,
          postId,
          commentId,
          message,
          isRead: false,
          createdAt: new Date().toISOString()
        };

        // Emit real-time notification
        if (io) {
          io.to(`user-${recipientId}`).emit('new-notification', notification);
        }

        resolve(notification);
      }
    );
  });
};

export const getNotifications = (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const db = getDatabase();
    
    db.all(`
      SELECT n.*, u.username as senderUsername, u.profilePicture as senderProfilePicture
      FROM notifications n
      JOIN users u ON n.senderId = u.id
      WHERE n.recipientId = ?
      ORDER BY n.createdAt DESC
      LIMIT ? OFFSET ?
    `, [userId, parseInt(limit), offset], (err, notifications) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({ notifications });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const markAsRead = (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const db = getDatabase();
    
    db.run(
      'UPDATE notifications SET isRead = 1 WHERE id = ? AND recipientId = ?',
      [id, userId],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Notification not found' });
        }

        res.json({ message: 'Notification marked as read' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const markAllAsRead = (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDatabase();
    
    db.run(
      'UPDATE notifications SET isRead = 1 WHERE recipientId = ? AND isRead = 0',
      [userId],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        res.json({ 
          message: 'All notifications marked as read',
          updatedCount: this.changes
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};