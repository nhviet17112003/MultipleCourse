import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';

import "rc-slider/assets/index.css";
import 'react-toastify/dist/ReactToastify.css';
const DetailCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullname, setFullname] = useState(""); // Thêm phần tên người dùng
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Xác định người dùng đã đăng nhập hay chưa
const [cartCount, setCartCount] = useState(0);
  // Kiểm tra đăng nhập và lấy thông tin fullname
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

  // Lấy thông tin chi tiết khóa học
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
  }, [id]);

 const handleAddToCart = async (courseId) => {
    const newCartCount = cartCount + 1;
    setCartCount(newCartCount);
    localStorage.setItem("cartCount", newCartCount);

    try {
      const response = await fetch(
        `http://localhost:3000/api/cart/add-to-cart/${courseId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        toast.success("Thêm vào giỏ hàng thành công!", {
          position: "top-right",
          autoClose: 3000, // Đóng sau 3 giây
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      } else {
        toast.error(`Lỗi: ${data.message}`, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };
 

  return (
    <div className="min-h-screen bg-gray-100">
       <ToastContainer />
    <div className="container mx-auto px-4 py-8">
      {/* Hiển thị loading nếu dữ liệu chưa sẵn sàng */}
      {loading ? (
        <p className="text-center text-teal-600 text-xl">Đang tải dữ liệu...</p>
      ) : course ? (
        // Nội dung chi tiết khóa học
        <div className="bg-white shadow-lg rounded-lg overflow-hidden md:grid md:grid-cols-2 md:gap-8 p-6">
          <div className="md:flex md:justify-center md:items-center">
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-72 object-cover rounded-xl shadow-lg transform hover:scale-105 transition duration-300"
            />
          </div>
          <div className="mt-4 md:mt-0">
            <h2 className="text-3xl font-semibold text-teal-600">{course.title}</h2>
            <p className="text-lg text-gray-600 mt-2 italic">
              Danh mục: {course.category}
            </p>
            <p className="mt-4 text-gray-700 leading-relaxed">{course.description}</p>
            <div className="mt-6 flex justify-between items-center">
              <p className="text-3xl text-teal-800 font-bold">${course.price}</p>
              <p className="text-sm text-gray-500 italic">
                Ngày tạo: {new Date(course.createAt).toLocaleDateString()}
              </p>
            </div>
            {/* Nút Thêm vào giỏ hàng */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(course._id);
              }}
              className="mt-4 bg-teal-600 text-white py-2 px-6 rounded-lg hover:bg-teal-700 transition duration-300"
            >
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      ) : (
        // Hiển thị nếu không tìm thấy dữ liệu khóa học
        <p className="text-center text-red-600 text-xl">
          Không tìm thấy thông tin khóa học.
        </p>
      )}
  
      {/* Nút quay lại */}
      <div className="mt-6 text-center">
        <button
          onClick={() => navigate(-1)} // Quay lại trang trước
          className="bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700 transition duration-300"
        >
          Quay lại
        </button>
      </div>
    </div>
  </div>
    );
};

export default DetailCourse;
