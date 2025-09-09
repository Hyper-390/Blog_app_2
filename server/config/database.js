import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db;

export const initDatabase = () => {
  db = new sqlite3.Database(join(__dirname, '../database.sqlite'));
  
  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');
  
  // Create tables
  createTables();
};

const createTables = () => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      bio TEXT DEFAULT '',
      profilePicture TEXT DEFAULT '',
      isPrivate BOOLEAN DEFAULT 0,
      isAdmin BOOLEAN DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Posts table
  db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      tags TEXT DEFAULT '',
      image TEXT DEFAULT '',
      authorId INTEGER NOT NULL,
      isDraft BOOLEAN DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (authorId) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Comments table
  db.run(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      body TEXT NOT NULL,
      authorId INTEGER NOT NULL,
      postId INTEGER NOT NULL,
      parentId INTEGER DEFAULT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (authorId) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (postId) REFERENCES posts (id) ON DELETE CASCADE,
      FOREIGN KEY (parentId) REFERENCES comments (id) ON DELETE CASCADE
    )
  `);

  // Likes table
  db.run(`
    CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      postId INTEGER NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (postId) REFERENCES posts (id) ON DELETE CASCADE,
      UNIQUE(userId, postId)
    )
  `);

  // Follows table
  db.run(`
    CREATE TABLE IF NOT EXISTS follows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      followerId INTEGER NOT NULL,
      followingId INTEGER NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (followerId) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (followingId) REFERENCES users (id) ON DELETE CASCADE,
      UNIQUE(followerId, followingId)
    )
  `);

  // Notifications table
  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipientId INTEGER NOT NULL,
      senderId INTEGER NOT NULL,
      type TEXT NOT NULL,
      postId INTEGER DEFAULT NULL,
      commentId INTEGER DEFAULT NULL,
      message TEXT NOT NULL,
      isRead BOOLEAN DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (recipientId) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (senderId) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (postId) REFERENCES posts (id) ON DELETE CASCADE,
      FOREIGN KEY (commentId) REFERENCES comments (id) ON DELETE CASCADE
    )
  `);

  // Create indexes for performance
  db.run('CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(authorId)');
  db.run('CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(createdAt)');
  db.run('CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(postId)');
  db.run('CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(followerId)');
  db.run('CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(followingId)');
  db.run('CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipientId)');
};

export const getDatabase = () => db;

export const closeDatabase = () => {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed.');
      }
    });
  }
};