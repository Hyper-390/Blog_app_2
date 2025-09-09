import bcrypt from 'bcryptjs';
import { getDatabase, initDatabase } from '../config/database.js';

const seedData = {
  users: [
    {
      username: 'admin',
      email: 'admin@blogapp.com',
      password: 'admin123',
      bio: 'System Administrator',
      isAdmin: true
    },
    {
      username: 'john_doe',
      email: 'john@example.com',
      password: 'password123',
      bio: 'Full-stack developer passionate about web technologies',
      profilePicture: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      username: 'jane_smith',
      email: 'jane@example.com',
      password: 'password123',
      bio: 'UI/UX Designer who loves creating beautiful experiences',
      profilePicture: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      username: 'tech_writer',
      email: 'writer@example.com',
      password: 'password123',
      bio: 'Technical writer and blogger covering the latest in tech',
      profilePicture: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150'
    }
  ],
  
  posts: [
    {
      title: 'Getting Started with React Hooks',
      body: 'React Hooks revolutionized how we write components in React. In this comprehensive guide, we\'ll explore the most commonly used hooks and how they can simplify your code.\n\nThe useState hook allows us to add state to functional components, while useEffect lets us perform side effects. Combined, they provide all the functionality we need for most components.',
      tags: 'react,hooks,javascript,frontend',
      image: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      title: 'Modern CSS Techniques for 2024',
      body: 'CSS has evolved tremendously over the years. Today, we have powerful features like CSS Grid, Flexbox, and Custom Properties that make styling easier than ever.\n\nContainer queries are becoming mainstream, allowing us to write truly responsive components. Meanwhile, CSS-in-JS libraries continue to gain popularity in the React ecosystem.',
      tags: 'css,frontend,design,webdev',
      image: 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      title: 'Building Scalable Node.js Applications',
      body: 'Scalability is crucial for modern web applications. In this post, we\'ll explore various techniques for building Node.js applications that can handle growth.\n\nFrom proper error handling to database optimization, we\'ll cover the essential practices every Node.js developer should know.',
      tags: 'nodejs,backend,scalability,express',
      image: 'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=800'
    }
  ]
};

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    
    initDatabase();
    const db = getDatabase();
    
    // Clear existing data
    db.run('DELETE FROM notifications');
    db.run('DELETE FROM likes');
    db.run('DELETE FROM comments');
    db.run('DELETE FROM follows');
    db.run('DELETE FROM posts');
    db.run('DELETE FROM users');
    
    // Seed users
    for (let userData of seedData.users) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO users (username, email, password, bio, profilePicture, isAdmin) VALUES (?, ?, ?, ?, ?, ?)',
          [
            userData.username, 
            userData.email, 
            hashedPassword, 
            userData.bio, 
            userData.profilePicture || '', 
            userData.isAdmin ? 1 : 0
          ],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
    }
    
    // Seed posts
    for (let i = 0; i < seedData.posts.length; i++) {
      const postData = seedData.posts[i];
      const authorId = (i % 3) + 2; // Assign to non-admin users
      
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO posts (title, body, tags, image, authorId) VALUES (?, ?, ?, ?, ?)',
          [postData.title, postData.body, postData.tags, postData.image, authorId],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
    }
    
    // Create some follow relationships
    await new Promise((resolve, reject) => {
      db.run('INSERT INTO follows (followerId, followingId) VALUES (?, ?)', [2, 3], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    await new Promise((resolve, reject) => {
      db.run('INSERT INTO follows (followerId, followingId) VALUES (?, ?)', [3, 2], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('Database seeding completed successfully!');
    console.log('Admin credentials: admin@blogapp.com / admin123');
    console.log('User credentials: john@example.com / password123');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

seedDatabase();