import React, { useState, useEffect } from "react";
import axios from "axios";

const ViewCourseList = () => {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    // Lấy token từ localStorage
    const token = localStorage.getItem("authToken");

    // Nếu không có token, thông báo lỗi hoặc điều hướng về trang login
    if (!token) {
      setError("Bạn cần đăng nhập để xem khóa học.");
      return;
    }

    // Gửi yêu cầu API với token
    const fetchCourses = async () => {
        try {
          const response = await axios.get(
            "http://localhost:3000/api/courses/all-courses",
            {
              headers: {
                Authorization: `Bearer ${token}`, // Thêm token vào header
              },
            }
          );
          console.log("Dữ liệu nhận được từ server:", response.data); // Log dữ liệu trả về từ server
          setCourses(response.data);
        } catch (err) {
          if (err.response) {
            // Log chi tiết phản hồi lỗi từ server
            console.log("Lỗi từ server:", err.response);
            setError("Lỗi khi lấy danh sách khóa học: " + (err.response.data.message || "Không có thông tin chi tiết"));
          } else if (err.request) {
            // Log nếu không nhận được phản hồi từ server
            console.log("Không nhận được phản hồi từ server:", err.request);
            setError("Không nhận được phản hồi từ server.");
          } else {
            // Log nếu có lỗi xảy ra trong quá trình tạo yêu cầu
            console.log("Lỗi trong quá trình gửi yêu cầu:", err.message);
            setError("Đã có lỗi xảy ra.");
          }
        }
      };
      
      
      

    fetchCourses();
  }, []);

  return (
    <div className="container">
      {error && <div className="error">{error}</div>}
      <h2>Danh sách khóa học</h2>
      {courses.length > 0 ? (
        <ul>
          {courses.map((course) => (
            <li key={course._id}>
              <img src={course.image} alt={course.title} />
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <p>Giá: {course.price}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>Không có khóa học nào.</p>
      )}
    </div>
  );
};

export default ViewCourseList;
