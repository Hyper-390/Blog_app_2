import bcrypt from 'bcryptjs';
import { getDatabase } from '../config/database.js';

export const getUserProfile = (req, res) => {
  try {
    const { username } = req.params;
    const db = getDatabase();
    
    db.get(`
      SELECT u.id, u.username, u.email, u.bio, u.profilePicture, u.isPrivate, u.createdAt,
             COUNT(DISTINCT f1.id) as followersCount,
             COUNT(DISTINCT f2.id) as followingCount,
             COUNT(DISTINCT p.id) as postsCount
      FROM users u
      LEFT JOIN follows f1 ON u.id = f1.followingId
      LEFT JOIN follows f2 ON u.id = f2.followerId
      LEFT JOIN posts p ON u.id = p.authorId AND p.isDraft = 0
      WHERE u.username = ?
      GROUP BY u.id
    `, [username], (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if current user follows this profile
      if (req.user) {
        db.get(
          'SELECT id FROM follows WHERE followerId = ? AND followingId = ?',
          [req.user.id, user.id],
          (err, follow) => {
            user.isFollowing = !!follow;
            user.followersCount = parseInt(user.followersCount);
            user.followingCount = parseInt(user.followingCount);
            user.postsCount = parseInt(user.postsCount);
            res.json({ user });
          }
        );
      } else {
        user.isFollowing = false;
        user.followersCount = parseInt(user.followersCount);
        user.followingCount = parseInt(user.followingCount);
        user.postsCount = parseInt(user.postsCount);
        res.json({ user });
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { bio, profilePicture, isPrivate, currentPassword, newPassword } = req.body;
    const db = getDatabase();
    
    // Get current user data
    db.get(
      'SELECT * FROM users WHERE id = ?',
      [req.user.id],
      async (err, user) => {
        if (err || !user) {
          return res.status(404).json({ error: 'User not found' });
        }

        let updateData = {
          bio: bio !== undefined ? bio : user.bio,
          profilePicture: profilePicture !== undefined ? profilePicture : user.profilePicture,
          isPrivate: isPrivate !== undefined ? (isPrivate ? 1 : 0) : user.isPrivate
        };

        // Handle password change
        if (newPassword) {
          if (!currentPassword) {
            return res.status(400).json({ error: 'Current password required' });
          }
          
          const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
          if (!isCurrentPasswordValid) {
            return res.status(400).json({ error: 'Current password is incorrect' });
          }
          
          if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters' });
          }
          
          updateData.password = await bcrypt.hash(newPassword, 12);
        }

        const updateFields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
        const updateValues = [...Object.values(updateData), req.user.id];
        
        db.run(
          `UPDATE users SET ${updateFields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
          updateValues,
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Error updating profile' });
            }
            
            res.json({ 
              message: 'Profile updated successfully',
              user: {
                id: user.id,
                username: user.username,
                email: user.email,
                bio: updateData.bio,
                profilePicture: updateData.profilePicture,
                isPrivate: !!updateData.isPrivate
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

export const searchUsers = (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const db = getDatabase();
    
    db.all(`
      SELECT u.id, u.username, u.bio, u.profilePicture,
             COUNT(DISTINCT f.id) as followersCount
      FROM users u
      LEFT JOIN follows f ON u.id = f.followingId
      WHERE u.username LIKE ? OR u.bio LIKE ?
      GROUP BY u.id
      ORDER BY followersCount DESC
      LIMIT ?
    `, [`%${q}%`, `%${q}%`, parseInt(limit)], (err, users) => {
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