import { getDatabase } from '../config/database.js';

export const createPost = (req, res) => {
  try {
    const { title, body, tags, image, isDraft } = req.body;
    
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    const db = getDatabase();
    const tagsString = Array.isArray(tags) ? tags.join(',') : tags || '';
    
    db.run(
      'INSERT INTO posts (title, body, tags, image, authorId, isDraft) VALUES (?, ?, ?, ?, ?, ?)',
      [title, body, tagsString, image || '', req.user.id, isDraft ? 1 : 0],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Error creating post' });
        }

        res.status(201).json({
          message: 'Post created successfully',
          post: {
            id: this.lastID,
            title,
            body,
            tags: tagsString.split(',').filter(tag => tag.trim()),
            image,
            authorId: req.user.id,
            isDraft: isDraft || false
          }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getPosts = (req, res) => {
  try {
    const { page = 1, limit = 10, search, authorId } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT p.*, u.username, u.profilePicture,
             COUNT(DISTINCT l.id) as likesCount,
             COUNT(DISTINCT c.id) as commentsCount
      FROM posts p
      JOIN users u ON p.authorId = u.id
      LEFT JOIN likes l ON p.id = l.postId
      LEFT JOIN comments c ON p.id = c.postId
      WHERE p.isDraft = 0
    `;
    
    const params = [];
    
    if (search) {
      query += ' AND (p.title LIKE ? OR p.body LIKE ? OR p.tags LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (authorId) {
      query += ' AND p.authorId = ?';
      params.push(authorId);
    }
    
    query += ' GROUP BY p.id ORDER BY p.createdAt DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const db = getDatabase();
    
    db.all(query, params, (err, posts) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const formattedPosts = posts.map(post => ({
        ...post,
        tags: post.tags ? post.tags.split(',').filter(tag => tag.trim()) : [],
        likesCount: parseInt(post.likesCount),
        commentsCount: parseInt(post.commentsCount)
      }));

      res.json({ posts: formattedPosts });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getPostById = (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    db.get(`
      SELECT p.*, u.username, u.profilePicture,
             COUNT(DISTINCT l.id) as likesCount,
             COUNT(DISTINCT c.id) as commentsCount
      FROM posts p
      JOIN users u ON p.authorId = u.id
      LEFT JOIN likes l ON p.id = l.postId
      LEFT JOIN comments c ON p.id = c.postId
      WHERE p.id = ? AND p.isDraft = 0
      GROUP BY p.id
    `, [id], (err, post) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const formattedPost = {
        ...post,
        tags: post.tags ? post.tags.split(',').filter(tag => tag.trim()) : [],
        likesCount: parseInt(post.likesCount),
        commentsCount: parseInt(post.commentsCount)
      };

      res.json({ post: formattedPost });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updatePost = (req, res) => {
  try {
    const { id } = req.params;
    const { title, body, tags, image, isDraft } = req.body;
    const db = getDatabase();
    
    // Check if post exists and user owns it
    db.get(
      'SELECT authorId FROM posts WHERE id = ?',
      [id],
      (err, post) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (!post) {
          return res.status(404).json({ error: 'Post not found' });
        }
        
        if (post.authorId !== req.user.id) {
          return res.status(403).json({ error: 'Not authorized' });
        }

        const tagsString = Array.isArray(tags) ? tags.join(',') : tags || '';
        
        db.run(
          'UPDATE posts SET title = ?, body = ?, tags = ?, image = ?, isDraft = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
          [title, body, tagsString, image || '', isDraft ? 1 : 0, id],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Error updating post' });
            }
            
            res.json({ message: 'Post updated successfully' });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deletePost = (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    // Check if post exists and user owns it
    db.get(
      'SELECT authorId FROM posts WHERE id = ?',
      [id],
      (err, post) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (!post) {
          return res.status(404).json({ error: 'Post not found' });
        }
        
        if (post.authorId !== req.user.id) {
          return res.status(403).json({ error: 'Not authorized' });
        }

        db.run('DELETE FROM posts WHERE id = ?', [id], function(err) {
          if (err) {
            return res.status(500).json({ error: 'Error deleting post' });
          }
          
          res.json({ message: 'Post deleted successfully' });
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUserDrafts = (req, res) => {
  try {
    const db = getDatabase();
    
    db.all(
      'SELECT * FROM posts WHERE authorId = ? AND isDraft = 1 ORDER BY updatedAt DESC',
      [req.user.id],
      (err, drafts) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        const formattedDrafts = drafts.map(draft => ({
          ...draft,
          tags: draft.tags ? draft.tags.split(',').filter(tag => tag.trim()) : []
        }));

        res.json({ drafts: formattedDrafts });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};