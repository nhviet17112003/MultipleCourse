import React, { useEffect, useState } from 'react';
import axios from 'axios';


export default function ManageReview() {
  const [comment, setComment] = useState([]);
  const [comments, setComments] = useState([]);
  const token = localStorage.getItem('authToken'); // Assuming token is stored in localStorage

  useEffect(() => {
    fetchComments();
    
 
  }, []);

  const fetchComments = async () => {

    try {
      const response = await axios.get('http://localhost:3000/api/comments/show-all-comments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // console.log(response.data.comments);
      setComments(response.data.comments);
      // response.data.comments.forEach(comment => {
      //   console.log(comment.commentId);
      // });
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const toggleCommentStatus = async (type, commentId) => {
    
 
    try {
      console.log('Toggling comment status:', type, commentId);
      const url = type === 'course' 
        ? `http://localhost:3000/api/comments/change-course-comment-status/${commentId}`
        : `http://localhost:3000/api/comments/change-lesson-comment-status/${commentId}`;
      await axios.put(url, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchComments();
      console.log('Comment status updated successfully');
    } catch (error) {
      console.error('Error updating comment status:', error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-center mb-6">Manage Reviews</h1>
      {comments.length > 0 ? (
        <ul>
          {comments.map((comment) => (
            <li key={comment.commentId} className="p-4 border-b flex justify-between items-center">
              <div>
                <p className="text-gray-800"><strong>{comment.author}</strong> ({comment.type === 'course' ? comment.courseTitle : comment.lessonTitle})</p>
                <p className="text-gray-600 italic">{comment.comment}</p>
                <p className="text-sm text-gray-500">Rating: {comment.rating} | Status: {comment.status ? 'Active' : 'Inactive'}</p>
              </div>
              <button 
                onClick={() => toggleCommentStatus(comment.type, comment.commentId)}
 
                className={`px-4 py-2 rounded-md text-white ${comment.status ? 'bg-red-500' : 'bg-green-500'}`}>
                {comment.status ? 'Deactivate' : 'Activate'}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-600">No comments available.</p>
      )}
    </div>
  );
}
