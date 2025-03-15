import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Badge, Dropdown, Table, Tag } from 'antd';
import { toast, ToastContainer } from "react-toastify";
import { useTheme } from "../context/ThemeContext";
import { EllipsisOutlined, CheckOutlined, StopOutlined } from "@ant-design/icons";
import { Navigate } from 'react-router-dom';

export default function ManageReview() {

  const [comments, setComments] = useState([]);
  const token = localStorage.getItem('authToken'); // Assuming token is stored in localStorage
  const { theme } = useTheme();
  useEffect(() => {
    fetchComments();
    
 
  }, [token]);

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

  // const toggleCommentStatus = async (type, commentId) => {
    
 
  //   try {
  //     console.log('Toggling comment status:', type, commentId);
  //     const url = type === 'course' 
  //       ? `http://localhost:3000/api/comments/change-course-comment-status/${commentId}`
  //       : `http://localhost:3000/api/comments/change-lesson-comment-status/${commentId}`;
  //     await axios.put(url, {}, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //  fetchComments();
  //     console.log('Comment status updated successfully');
  //     toast.success('Comment status updated successfully');
  //   } catch (error) {
  //     console.error('Error updating comment status:', error);
  //     toast.error('Error updating comment status');
  //   }
  // };
  

  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Full Name',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: 'Course Name',
      dataIndex: 'courseTitle',
      key: 'courseTitle',
    },
    {
      title: 'Content',
      dataIndex: 'comment',
      key: 'comment',
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => '⭐'.repeat(rating),
    },
     {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => status ? <Tag color='green'>Active</Tag>: <Tag color='red'>Inactive</Tag>,
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        // <button
        //   onClick={() => toggleCommentStatus(record.type, record.commentId)}
        //   className={`px-4 py-2 rounded-md text-white ${
        //     record.status ? 'bg-red-500' : 'bg-green-500'
        //   }`}
        // >
        //   {record.status ? 'Deactivate' : 'Activate'}
        // </button>
        <DropDownMenu  record={record} fetchComments={fetchComments}/>  
      ),
    },
  ];
  const data = comments.map((comment) => ({
    key: comment.commentId,
    author: comment.author,
    courseTitle: comment.type === 'course' ? comment.courseTitle : comment.lessonTitle,
    comment: comment.comment,
    rating: comment.rating,
    status: comment.status,
    type: comment.type,
    commentId: comment.commentId,
  }));
  return (
    <div className="container mx-auto p-6">
    <h1 className="text-3xl font-bold text-center mb-6">Manage Reviews</h1>

     <Table columns={columns} dataSource={data} />
        <ToastContainer theme={theme === "dark" ? "dark" : "light"} />
  </div>
  
  );
}

const DropDownMenu = ({record, fetchComments}) =>{
const token = localStorage.getItem('authToken'); // Assuming token is stored in localStorage
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
      toast.success('Comment status updated successfully');
    } catch (error) {
      console.error('Error updating comment status:', error);
      toast.error('Error updating comment status');
    }
  };

 const items = [
  {
    key: '1',
    label: (
      <div 
        onClick={() => toggleCommentStatus(record.type, record.commentId)}
        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors duration-150"
      >
        {record.status ? (
          <>
         
            <StopOutlined className="h-4 w-4 text-red-500"/>
            <span>Ban</span>
          </>
        ) : (
          <>
            <CheckOutlined className="h-4 w-4 text-green-500" />
            
            <span>Unban</span>
          </>
        )}
      </div>
    ),
  },
];
  return(
    <div>

<Dropdown menu={{items}}>
          <EllipsisOutlined />
        </Dropdown>

 
    </div>
   
        
  )
}