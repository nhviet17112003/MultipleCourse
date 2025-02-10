import React, { useEffect, useState } from "react";
import axios from "axios";

const CourseListForAdmin = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [fullname, setFullname] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated(true);
      const savedFullname = localStorage.getItem("fullname");
      setFullname(savedFullname || "Người dùng");
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const response = await axios.get("http://localhost:3000/api/courses/all-courses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(response.data);
      } catch (err) {
        setError("Lỗi khi tải danh sách khóa học");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const toggleCourseStatus = async (courseId) => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.put(
        `http://localhost:3000/api/courses/change-course-status/${courseId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert(response.data.message);
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course._id === courseId ? { ...course, status: !course.status } : course
        )
      );
    } catch (err) {
      alert("Lỗi khi thay đổi trạng thái khóa học");
    }
  };

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Danh sách khóa học</h2>
      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên khóa học</th>
            <th>Mô tả</th>
            <th>Giảng viên</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course._id}>
              <td>{course._id}</td>
              <td>{course.name}</td>
              <td>{course.description}</td>
              <td>{course.instructor}</td>
              <td>{course.status ? "Hoạt động" : "Không hoạt động"}</td>
              <td>
                <button onClick={() => toggleCourseStatus(course._id)}>
                  {course.status ? "Vô hiệu hóa" : "Kích hoạt"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CourseListForAdmin;
