import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa"; // Biểu tượng giỏ hàng

const HomeScreen = () => {
  const navigate = useNavigate();
  const [fullname, setFullname] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cartCount, setCartCount] = useState(0); // Số lượng sản phẩm trong giỏ hàng

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
      try {
        const response = await fetch(
          "http://localhost:3000/api/courses/active-courses",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        if (response.ok) {
          setCourses(data);
        } else {
          console.log("Error fetching courses:", data.message);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleCourseClick = (id) => {
    navigate(`/coursedetail/${id}`);
  };

  const handleAddToCart = async (courseId) => {
    const newCartCount = cartCount + 1;
    setCartCount(newCartCount); // Cập nhật giỏ hàng trên UI

    // Lưu vào localStorage
    localStorage.setItem("cartCount", newCartCount);

    // Gửi yêu cầu thêm sản phẩm vào giỏ hàng
    try {
      const response = await fetch(
        `http://localhost:3000/api/cart/add-to-cart/${courseId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`, // Nếu cần token xác thực
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        console.log("Sản phẩm đã được thêm vào giỏ hàng", data);
      } else {
        console.log("Lỗi khi thêm sản phẩm vào giỏ hàng", data.message);
      }
    } catch (error) {
      console.error("Lỗi:", error);
    }
  };

  const goToLogin = () => {
    navigate("/login");
  };

  const goToSignup = () => {
    navigate("/signup");
  };

  const goToCart = () => {
    navigate("/cart");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-teal-500 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">Welcome to Lorem</h1>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <span className="text-lg">
                Xin chào,{" "}
                <span
                  className="font-semibold text-yellow-300 cursor-pointer hover:text-teal-400 hover:scale-105 transition-transform duration-200"
                  onClick={() => navigate("/userprofile")}
                >
                  {fullname}
                </span>
                !
              </span>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={goToLogin}
                  className="bg-yellow-300 text-teal-700 px-4 py-2 rounded hover:bg-yellow-400"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={goToSignup}
                  className="bg-white text-teal-700 px-4 py-2 rounded border border-teal-700 hover:bg-teal-100"
                >
                  Đăng ký
                </button>
              </div>
            )}
            <div className="relative">
              <FaShoppingCart
                className="text-white text-2xl cursor-pointer"
                onClick={goToCart}
              />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Marketing Articles</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          {loading ? (
            <p>Đang tải danh sách khóa học...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {courses.length > 0 ? (
                courses.map((course) => (
                  <div
                    key={course._id}
                    onClick={() => handleCourseClick(course._id)}
                    className="bg-white shadow-md rounded-lg overflow-hidden"
                  >
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h4 className="text-lg font-semibold text-teal-600">
                        {course.title}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1 italic">
                        {course.category}
                      </p>
                      <p className="text-gray-600 mt-2">{course.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-teal-700 font-bold">
                          ${course.price}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Ngừng sự kiện "click" bọt bể lên các phần tử cha (như handleCourseClick)
                            handleAddToCart(course._id); // Chỉ thực hiện thêm vào giỏ
                          }}
                          className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
                        >
                          Thêm vào giỏ
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>Không có khóa học nào hiện tại.</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomeScreen;
