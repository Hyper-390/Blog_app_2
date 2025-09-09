import React from 'react';
import PostForm from '../../components/Post/PostForm';

const CreatePost = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        <PostForm />
      </div>
    </div>
  );
};

export default CreatePost;