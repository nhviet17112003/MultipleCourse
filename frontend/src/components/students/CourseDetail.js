import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const DetailCourse = () => {
  const { id } = useParams(); // Lấy id từ URL
  const navigate = useNavigate(); // Điều hướng quay lại hoặc tới nơi khác
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullname, setFullname] = useState(""); // Thêm phần tên người dùng
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Xác định người dùng đã đăng nhập hay chưa

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
    const fetchCourseDetail = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const response = await fetch(
          `http://localhost:3000/api/courses/detail/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (response.ok) {
          setCourse(data.courseDetail);
        } else {
          console.error("Error fetching course detail:", data.message);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseDetail();
  }, [id]); // Đảm bảo mảng dependencies chỉ chứa `id`

  if (loading) {
    return <p>Đang tải thông tin khóa học...</p>;
  }

  if (!course) {
    return <p>Không tìm thấy khóa học.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Thông tin chi tiết khóa học */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden md:grid md:grid-cols-2 md:gap-8 p-6">
          <div className="md:flex md:justify-center md:items-center">
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-64 object-cover rounded-lg shadow-md"
            />
          </div>
          <div className="mt-4 md:mt-0">
            <h2 className="text-3xl font-semibold text-teal-600">
              {course.title}
            </h2>
            <p className="text-lg text-gray-600 mt-2 italic">
              Danh mục: {course.category}
            </p>
            <p className="mt-4 text-gray-700 leading-relaxed">
              {course.description}
            </p>
            <div className="mt-6 flex justify-between items-center">
              <p className="text-2xl text-teal-700 font-semibold">
                Giá: ${course.price}
              </p>
              <p className="text-sm text-gray-500 italic">
                Ngày tạo: {new Date(course.createAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Nút quay lại */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate(-1)} // Quay lại trang trước
            className="bg-teal-600 text-white py-2 px-6 rounded-lg hover:bg-teal-700 transition duration-300"
          >
            Quay lại
          </button>
        </div>
      </div>
    </div>
  </div>
);
};

export default DetailCourse;
