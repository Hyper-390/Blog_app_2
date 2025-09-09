import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MoreHorizontal, Edit, Trash2, Reply } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const CommentCard = ({ comment, onDelete, onReply }) => {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editBody, setEditBody] = useState(comment.body);
  const [loading, setLoading] = useState(false);

  const handleEdit = async () => {
    setLoading(true);
    try {
      await api.put(`/comments/${comment.id}`, { body: editBody });
      comment.body = editBody;
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await api.delete(`/comments/${comment.id}`);
        onDelete && onDelete(comment.id);
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
    setShowMenu(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <Link 
          to={`/profile/${comment.username}`}
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
        >
          <img
            src={comment.profilePicture || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=40'}
            alt={comment.username}
            className="h-8 w-8 rounded-full object-cover"
          />
          <div>
            <h5 className="font-medium text-gray-900">{comment.username}</h5>
            <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
          </div>
        </Link>

        {user && user.id === comment.authorId && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-50 w-full text-left"
                >
                  <Edit className="h-3 w-3" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            rows={3}
          />
          <div className="flex items-center space-x-2">
            <button
              onClick={handleEdit}
              disabled={loading || !editBody.trim()}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditBody(comment.body);
              }}
              className="px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-gray-700 mb-3 leading-relaxed">{comment.body}</p>
          
          {user && (
            <button
              onClick={() => onReply && onReply(comment)}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              <Reply className="h-3 w-3" />
              <span>Reply</span>
            </button>
          )}
        </>
      )}

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 ml-6 space-y-3">
          {comment.replies.map(reply => (
            <CommentCard
              key={reply.id}
              comment={reply}
              onDelete={onDelete}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentCard;