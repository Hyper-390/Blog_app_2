import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, TrendingUp, BookOpen } from 'lucide-react';
import PostCard from '../../components/Post/PostCard';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const Home = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchPosts();
    if (user) {
      fetchSuggestedUsers();
    }
  }, [user]);

  const fetchPosts = async (pageNum = 1) => {
    try {
      const response = await api.get(`/posts?page=${pageNum}&limit=10`);
      const newPosts = response.data.posts;
      
      if (pageNum === 1) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
      
      setHasMore(newPosts.length === 10);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestedUsers = async () => {
    try {
      const response = await api.get('/follow/suggestions/users');
      setSuggestedUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching suggested users:', error);
    }
  };

  const handlePostDelete = (postId) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  };

  const handleLoadMore = () => {
    fetchPosts(page + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Welcome Section */}
          {!user && (
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white mb-8">
              <h1 className="text-3xl font-bold mb-4">Welcome to BlogApp</h1>
              <p className="text-xl mb-6 opacity-90">
                Discover amazing stories, connect with writers, and share your own experiences.
              </p>
              <div className="flex items-center space-x-4">
                <Link
                  to="/register"
                  className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>
          )}

          {/* Posts Feed */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Latest Posts</h2>
              {user && (
                <Link
                  to="/create"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Write a Post
                </Link>
              )}
            </div>

            {posts.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-500">Be the first to share your story!</p>
              </div>
            ) : (
              <>
                {posts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onDelete={handlePostDelete}
                  />
                ))}

                {hasMore && (
                  <div className="text-center">
                    <button
                      onClick={handleLoadMore}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Load More Posts
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              Community Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Posts</span>
                <span className="font-semibold">{posts.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Users</span>
                <span className="font-semibold">{suggestedUsers.length + 1}</span>
              </div>
            </div>
          </div>

          {/* Suggested Users */}
          {user && suggestedUsers.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Suggested Users
              </h3>
              <div className="space-y-4">
                {suggestedUsers.slice(0, 3).map(suggestedUser => (
                  <Link
                    key={suggestedUser.id}
                    to={`/profile/${suggestedUser.username}`}
                    className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                  >
                    <img
                      src={suggestedUser.profilePicture || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=40'}
                      alt={suggestedUser.username}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{suggestedUser.username}</p>
                      <p className="text-sm text-gray-500 truncate">{suggestedUser.bio}</p>
                    </div>
                  </Link>
                ))}
              </div>
              
              <Link
                to="/search"
                className="block text-center text-blue-600 hover:text-blue-700 text-sm font-medium mt-4"
              >
                Discover more users
              </Link>
            </div>
          )}

          {/* Popular Tags */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {['react', 'javascript', 'css', 'nodejs', 'frontend', 'backend'].map(tag => (
                <Link
                  key={tag}
                  to={`/search?q=${tag}`}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-blue-100 hover:text-blue-800 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;