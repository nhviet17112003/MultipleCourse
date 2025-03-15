import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Dropdown, Table, Tag } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
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
  const navigate = useNavigate()
  const toggleCourseStatus = async (courseId) => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.put(
        `http://localhost:3000/api/courses/change-course-status/${courseId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Course status changed successfully.");
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course._id === courseId
            ? { ...course, status: !course.status }
            : course
        )
      );
     
    } catch (err) {
      console.log(err)
   toast.error("Error changing course status.");
    }
  }; 
   const items = [
    {
      key: '1',
      label: (
        <div 
          onClick={() => toggleCourseStatus(record._id)}
          className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors duration-150 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          Ban
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

 
    </div>
   
        
  )
}
