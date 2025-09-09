import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Calendar } from 'lucide-react';
import CommentCard from '../../components/Comment/CommentCard';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const PostDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    fetchPost();
    fetchComments();
    if (user) {
      checkUserLike();
    }
  }, [id, user]);

  const fetchPost = async () => {
    try {
      const response = await api.get(`/posts/${id}`);
      setPost(response.data.post);
      setLikesCount(response.data.post.likesCount);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await api.get(`/comments/post/${id}`);
      setComments(response.data.comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const checkUserLike = async () => {
    try {
      const response = await api.get(`/likes/posts/${id}/check`);
      setIsLiked(response.data.isLiked);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const handleLike = async () => {
    if (!user) return;

    try {
      if (isLiked) {
        await api.delete(`/likes/posts/${id}`);
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        await api.post(`/likes/posts/${id}`);
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentLoading(true);
    try {
      await api.post('/comments', {
        body: newComment,
        postId: id,
        parentId: replyTo?.id || null
      });
      
      setNewComment('');
      setReplyTo(null);
      fetchComments();
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleReply = (comment) => {
    setReplyTo(comment);
    setNewComment(`@${comment.username} `);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Post not found</h2>
          <p className="text-gray-600">The post you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Post Content */}
        <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          {post.image && (
            <div className="aspect-video overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-8">
            {/* Author Info */}
            <div className="flex items-center justify-between mb-6">
              <Link 
                to={`/profile/${post.username}`}
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
              >
                <img
                  src={post.profilePicture || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=40'}
                  alt={post.username}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{post.username}</h4>
                  <p className="text-sm text-gray-500 flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(post.createdAt)}
                  </p>
                </div>
              </Link>

              <button
                onClick={() => navigator.share({ url: window.location.href })}
                className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>

            {/* Post Content */}
            <h1 className="text-4xl font-bold text-gray-900 mb-6">{post.title}</h1>
            
            <div className="prose max-w-none mb-6">
              {post.body.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-700 leading-relaxed text-lg">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map(tag => (
                  <Link
                    key={tag}
                    to={`/search?q=${tag}`}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full hover:bg-blue-200 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-6">
                <button
                  onClick={handleLike}
                  disabled={!user}
                  className={`flex items-center space-x-2 transition-colors ${
                    isLiked 
                      ? 'text-red-500 hover:text-red-600' 
                      : 'text-gray-500 hover:text-red-500'
                  } ${!user ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  <Heart className={`h-6 w-6 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="font-medium">{likesCount}</span>
                </button>

                <div className="flex items-center space-x-2 text-gray-500">
                  <MessageCircle className="h-6 w-6" />
                  <span className="font-medium">{comments.length}</span>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Comments ({comments.length})
          </h3>

          {/* Add Comment Form */}
          {user ? (
            <form onSubmit={handleCommentSubmit} className="mb-8">
              {replyTo && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Replying to <span className="font-medium">@{replyTo.username}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setReplyTo(null);
                      setNewComment('');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Cancel
                  </button>
                </div>
              )}
              
              <div className="flex space-x-3">
                <img
                  src={user.profilePicture || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=40'}
                  alt={user.username}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                    rows={3}
                  />
                  <div className="mt-3 flex justify-end">
                    <button
                      type="submit"
                      disabled={!newComment.trim() || commentLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {commentLoading ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-600 mb-3">Please log in to join the conversation</p>
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              comments.map(comment => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  onDelete={(commentId) => setComments(prev => prev.filter(c => c.id !== commentId))}
                  onReply={handleReply}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;