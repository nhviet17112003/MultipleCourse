import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Dropdown, Table, Tag } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { CheckOutlined, StopOutlined } from "@ant-design/icons";

const CourseListForAdmin = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const response = await axios.get(
          "http://localhost:3000/api/courses/all-courses",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log(response.data);
        setCourses(response.data);
      } catch (err) {
        setError("Error loading course list.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // const toggleCourseStatus = async (courseId) => {
  //   const token = localStorage.getItem("authToken");
  //   try {
  //     const response = await axios.put(
  //       `http://localhost:3000/api/courses/change-course-status/${courseId}`,
  //       {},
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
  //     alert(response.data.message);
  //     setCourses((prevCourses) =>
  //       prevCourses.map((course) =>
  //         course._id === courseId
  //           ? { ...course, status: !course.status }
  //           : course
  //       )
  //     );
  //   } catch (err) {
  //     alert("Error changing course status.");
  //   }
  // };

  if (loading) return <p className="text-center text-gray-600">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  
  const columns = [
    {
      title: "Course Name",
      dataIndex: "title",
      key: "title",
      render: (title, record) => (
        <a href={`/courses-list-for-admin/${record._id}`}>{title}</a>
      ),
    },
    // {
    //   title: "Description",
    //   dataIndex: "description",
    //   key: "description",
    // },
    {
      title: "Tutor Name",
      dataIndex: "tutor",
      key: "tutor",
      render: (tutor) => tutor.fullname,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
    status ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (record) => (
       <DropDownMenu  record={record} setCourses={setCourses} courses={courses}/>  
      ),
    },
  ];
  const data = courses.map((course) => ({
    key: course._id,
    ...course,
  }));
  
  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-6">
        List of Courses
      </h2>
      <div className="overflow-x-auto">
        <Table columns={columns} dataSource={data} />
      </div>
      <ToastContainer />
    </div>
  );
};  

export default CourseListForAdmin;


const DropDownMenu = ({record,setCourses, courses}) =>{
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const navigate = useNavigate()
  const toggleCourseStatus = async (courseId, status, message = "") => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.put(
        `http://localhost:3000/api/courses/change-course-status/${courseId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, message }), }
      );
      toast.success("Course status changed successfully.");
      // setCourses((prevCourses) =>
      //   prevCourses.map((course) =>
      //     course._id === courseId
      //       ? { ...course, status: !course.status }
      //       : course
      //   )
      // );
      const updateCourses = courses.map((course) =>
        course._id === courseId ? { ...course, status: !course.status } : course
      );
      setCourses(updateCourses);
      setIsModalOpen(false);
      setRejectReason("");
     
    } catch (err) {
      console.log(err)
   toast.error("Error changing course status.");
    }
  }; 
    // Xử lý khi người dùng nhấn vào Ban/Unban
    const handleStatusToggleClick = () => {
      if (record.status) {
        // Nếu user đang active, hiển thị modal khi muốn ban
        setIsModalOpen(true);
      } else {
        // Nếu user đang inactive, unban trực tiếp không cần lý do
        toggleCourseStatus(record.key);
      }
    };
  
    const items = [
      {
        key: '1',
        label: (
          <div 
            onClick={handleStatusToggleClick}
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

      {
        key: '2',
        label: (
          <div 
            onClick={() => navigate(`/courses-list-for-admin/${record._id}`)}
            className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View detail
          </div>
        ),
      },
    ];
  
    return(
      <div>
        <Dropdown menu={{items}}>
          <EllipsisOutlined />
        </Dropdown>
  
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70 backdrop-blur-md z-50">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-96 border border-gray-100 dark:border-gray-700 transform transition-all">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Rejection Reason
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-6">
                <textarea
                  className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white transition duration-300 resize-none"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Please provide a detailed reason for rejection..."
                  rows="4"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-300 font-medium"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition duration-300 shadow-lg hover:shadow-xl font-medium flex items-center"
                  onClick={() => {
                    toggleCourseStatus(
                      record.key,
                      "Rejected",
                      rejectReason
                    );
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };