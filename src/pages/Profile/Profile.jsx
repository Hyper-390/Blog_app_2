import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  Users, 
  UserPlus, 
  UserMinus, 
  Settings,
  Grid3X3,
  BookOpen,
  FileText
} from 'lucide-react';
import PostCard from '../../components/Post/PostCard';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (username) {
      fetchProfile();
      fetchUserPosts();
    }
  }, [username]);

  const fetchProfile = async () => {
    try {
      const response = await api.get(`/users/${username}`);
      setProfile(response.data.user);
      setIsFollowing(response.data.user.isFollowing);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const profileResponse = await api.get(`/users/${username}`);
      const userId = profileResponse.data.user.id;
      const response = await api.get(`/posts?authorId=${userId}`);
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const fetchFollowers = async () => {
    if (!profile) return;
    try {
      const response = await api.get(`/follow/${profile.id}/followers`);
      setFollowers(response.data.followers);
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  };

  const fetchFollowing = async () => {
    if (!profile) return;
    try {
      const response = await api.get(`/follow/${profile.id}/following`);
      setFollowing(response.data.following);
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  };

  const handleFollow = async () => {
    if (!currentUser || !profile) return;

    try {
      if (isFollowing) {
        await api.delete(`/follow/${profile.id}`);
        setProfile(prev => ({ ...prev, followersCount: prev.followersCount - 1 }));
      } else {
        await api.post(`/follow/${profile.id}`);
        setProfile(prev => ({ ...prev, followersCount: prev.followersCount + 1 }));
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'followers' && followers.length === 0) {
      fetchFollowers();
    } else if (tab === 'following' && following.length === 0) {
      fetchFollowing();
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User not found</h2>
          <p className="text-gray-600">The profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.username === username;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <img
              src={profile.profilePicture || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150'}
              alt={profile.username}
              className="h-24 w-24 rounded-full object-cover mx-auto sm:mx-0"
            />
            
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile.username}</h1>
              {profile.bio && (
                <p className="text-gray-600 mb-4 max-w-md">{profile.bio}</p>
              )}
              
              <div className="flex items-center justify-center sm:justify-start space-x-6 text-sm text-gray-500 mb-4">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Joined {formatDate(profile.createdAt)}
                </span>
              </div>

              <div className="flex items-center justify-center sm:justify-start space-x-6">
                <button
                  onClick={() => handleTabChange('posts')}
                  className={`text-sm font-medium ${activeTab === 'posts' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <span className="font-bold">{profile.postsCount}</span> Posts
                </button>
                <button
                  onClick={() => handleTabChange('followers')}
                  className={`text-sm font-medium ${activeTab === 'followers' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <span className="font-bold">{profile.followersCount}</span> Followers
                </button>
                <button
                  onClick={() => handleTabChange('following')}
                  className={`text-sm font-medium ${activeTab === 'following' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <span className="font-bold">{profile.followingCount}</span> Following
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {isOwnProfile ? (
                <Link
                  to="/settings"
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  <span>Edit Profile</span>
                </Link>
              ) : currentUser ? (
                <button
                  onClick={handleFollow}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isFollowing
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="h-4 w-4" />
                      <span>Unfollow</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => handleTabChange('posts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'posts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } transition-colors`}
            >
              <Grid3X3 className="h-4 w-4 inline mr-2" />
              Posts
            </button>
            <button
              onClick={() => handleTabChange('followers')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'followers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } transition-colors`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Followers
            </button>
            <button
              onClick={() => handleTabChange('following')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'following'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } transition-colors`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Following
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {isOwnProfile ? "You haven't written any posts yet" : "No posts yet"}
                </h3>
                <p className="text-gray-500">
                  {isOwnProfile ? "Share your thoughts and experiences with the community!" : "This user hasn't shared any posts yet."}
                </p>
                {isOwnProfile && (
                  <Link
                    to="/create"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-4"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Write Your First Post</span>
                  </Link>
                )}
              </div>
            ) : (
              posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onDelete={(postId) => setPosts(prev => prev.filter(p => p.id !== postId))}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'followers' && (
          <div className="space-y-4">
            {followers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No followers yet</h3>
                <p className="text-gray-500">
                  {isOwnProfile ? "Start sharing great content to attract followers!" : "This user doesn't have any followers yet."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {followers.map(follower => (
                  <Link
                    key={follower.id}
                    to={`/profile/${follower.username}`}
                    className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={follower.profilePicture || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=40'}
                        alt={follower.username}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{follower.username}</p>
                        <p className="text-sm text-gray-500 truncate">{follower.bio}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'following' && (
          <div className="space-y-4">
            {following.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Not following anyone yet</h3>
                <p className="text-gray-500">
                  {isOwnProfile ? "Discover interesting people to follow!" : "This user isn't following anyone yet."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {following.map(followedUser => (
                  <Link
                    key={followedUser.id}
                    to={`/profile/${followedUser.username}`}
                    className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={followedUser.profilePicture || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=40'}
                        alt={followedUser.username}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{followedUser.username}</p>
                        <p className="text-sm text-gray-500 truncate">{followedUser.bio}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;