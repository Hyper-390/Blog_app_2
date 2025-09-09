import React from 'react';
import { useParams } from 'react-router-dom';
import PostForm from '../../components/Post/PostForm';

const EditPost = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        <PostForm postId={id} />
      </div>
    </div>
  );
};

export default EditPost;