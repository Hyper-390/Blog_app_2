# BlogApp - Full-Featured Blogging Platform

A complete blogging application with Express.js backend and React frontend, featuring user authentication, post management, social features, and real-time notifications.

## Features

### 🔐 Authentication System
- User registration and login with JWT
- Password hashing with bcrypt
- Protected routes and session management
- Admin role management

### 👤 User Profiles
- Customizable profiles with bio and profile pictures
- Privacy settings and profile management
- Follower/following system with real-time counts
- User search and discovery

### 📝 Post Management
- Create, edit, delete, and publish posts
- Draft system for saving work-in-progress
- Rich content with images and tags
- Search and pagination functionality

### 💬 Social Features
- Like and unlike posts
- Nested comment system with replies
- Follow/unfollow users
- Real-time interaction counts

### 🔔 Notification System
- Real-time notifications using Socket.IO
- Notifications for follows, likes, and comments
- Mark as read/unread functionality
- Browser push notifications

### 👑 Admin Features
- Admin panel with platform statistics
- User and content management
- Database seeding capabilities
- System monitoring tools

## Project Structure

### Backend (`/server`)
```
server/
├── config/
│   └── database.js          # Database configuration and setup
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── userController.js    # User management
│   ├── postController.js    # Post operations
│   ├── commentController.js # Comment functionality
│   ├── followController.js  # Follow system
│   ├── likeController.js    # Like functionality
│   └── notificationController.js # Notifications
├── middleware/
│   ├── auth.js             # JWT authentication middleware
│   ├── errorHandler.js     # Global error handling
│   └── rateLimiter.js      # Rate limiting protection
├── routes/
│   ├── authRoutes.js       # Authentication endpoints
│   ├── userRoutes.js       # User-related endpoints
│   ├── postRoutes.js       # Post management endpoints
│   ├── commentRoutes.js    # Comment endpoints
│   ├── followRoutes.js     # Follow system endpoints
│   ├── likeRoutes.js       # Like functionality endpoints
│   └── notificationRoutes.js # Notification endpoints
├── scripts/
│   └── seed.js             # Database seeding script
└── server.js               # Main server file
```

### Frontend (`/src`)
```
src/
├── components/
│   ├── Header/
│   │   └── Header.jsx      # Navigation header
│   ├── Post/
│   │   ├── PostCard.jsx    # Post display component
│   │   └── PostForm.jsx    # Post creation/editing form
│   └── Comment/
│       └── CommentCard.jsx # Comment display component
├── contexts/
│   ├── AuthContext.jsx     # Authentication context
│   └── NotificationContext.jsx # Notification management
├── pages/
│   ├── Auth/
│   │   ├── Login.jsx       # Login page
│   │   └── Register.jsx    # Registration page
│   ├── Profile/
│   │   └── Profile.jsx     # User profile page
│   ├── Posts/
│   │   ├── CreatePost.jsx  # Post creation page
│   │   ├── EditPost.jsx    # Post editing page
│   │   └── PostDetail.jsx  # Individual post view
│   ├── Notifications/
│   │   └── Notifications.jsx # Notifications page
│   ├── Search/
│   │   └── Search.jsx      # Search functionality
│   ├── Admin/
│   │   └── AdminPanel.jsx  # Admin dashboard
│   └── Home/
│       └── Home.jsx        # Homepage/feed
├── services/
│   └── api.js              # API client configuration
└── App.jsx                 # Main application component
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile

### User Management
- `GET /api/users/:username` - Get user profile by username
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/search` - Search users

### Post Management
- `POST /api/posts` - Create new post
- `GET /api/posts` - Get all posts (with pagination and search)
- `GET /api/posts/:id` - Get specific post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `GET /api/posts/drafts` - Get user drafts

### Comments
- `POST /api/comments` - Create comment
- `GET /api/comments/post/:postId` - Get post comments
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

### Follow System
- `POST /api/follow/:userId` - Follow user
- `DELETE /api/follow/:userId` - Unfollow user
- `GET /api/follow/:userId/followers` - Get followers
- `GET /api/follow/:userId/following` - Get following
- `GET /api/follow/suggestions/users` - Get suggested users

### Likes
- `POST /api/likes/posts/:postId` - Like post
- `DELETE /api/likes/posts/:postId` - Unlike post
- `GET /api/likes/posts/:postId` - Get post likes
- `GET /api/likes/posts/:postId/check` - Check if user liked post

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/mark-all-read` - Mark all notifications as read

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file in the root directory:
```env
PORT=3001
JWT_SECRET=your-super-secret-jwt-key
CLIENT_URL=http://localhost:5173
```

3. Seed the database:
```bash
npm run seed
```

4. Start the application:
```bash
npm run dev
```

This will start both the backend server (http://localhost:3001) and the frontend development server (http://localhost:5173).

### Demo Accounts

The seeded database includes these test accounts:

**Admin Account:**
- Email: admin@blogapp.com
- Password: admin123

**Regular User:**
- Email: john@example.com  
- Password: password123

## Development

### Running Tests
```bash
npm run test
```

### Database Management
- Seed fresh data: `npm run seed`
- The database file is stored as `server/database.sqlite`

### Building for Production
```bash
npm run build
```

## Architecture Notes

### Security Features
- JWT token-based authentication
- Password hashing with bcrypt (12 salt rounds)
- Rate limiting on authentication endpoints
- CORS protection
- Helmet.js security headers
- SQL injection prevention with parameterized queries

### Real-time Features
- Socket.IO for real-time notifications
- Live interaction counts
- Instant follow/unfollow updates

### Performance Optimizations
- Database indexing on frequently queried columns
- Pagination for large datasets
- Image optimization recommendations
- Efficient SQL queries with proper joins

### Scalability Considerations
- Modular architecture for easy feature additions
- Clean separation of concerns
- RESTful API design
- Environment-based configuration

## Contributing

1. Follow the established file structure
2. Keep components under 200 lines when possible
3. Use proper error handling
4. Add appropriate tests for new features
5. Follow the existing code style

## License

MIT License - see LICENSE file for details.