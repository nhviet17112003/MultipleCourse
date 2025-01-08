import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa"; // Biểu tượng giỏ hàng
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
const HomeScreen = () => {
  const navigate = useNavigate();
  const [fullname, setFullname] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cartCount, setCartCount] = useState(0); // Số lượng sản phẩm trong giỏ hàng
  const [tutors, setTutors] = useState({}); // Lưu thông tin giảng viên theo ID
  const [filter, setFilter] = useState("");
  const [sortOption, setSortOption] = useState("default");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

  // Lấy thông tin người dùng khi đăng nhập
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

  // Fetch danh sách khóa học và thông tin giảng viên
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

          // Lấy danh sách tutorId duy nhất từ danh sách khóa học
          const uniqueTutorIds = [
            ...new Set(data.map((course) => course.tutorId)),
          ];

          // Fetch thông tin của tất cả tutor
          const tutorsData = {};
          await Promise.all(
            uniqueTutorIds.map(async (tutorId) => {
              if (tutorId) {
                const tutorResponse = await fetch(
                  `http://localhost:3000/api/tutors/${tutorId}`
                );
                const tutorData = await tutorResponse.json();
                if (tutorResponse.ok) {
                  tutorsData[tutorId] = tutorData.fullname;
                }
              }
            })
          );

          setTutors(tutorsData); // Lưu tutors vào state
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
      if (!response.ok) {
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
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const goToCart = () => {
    setIsDropdownOpen(false);
    navigate("/cart");
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("fullname");
    setIsDropdownOpen(false);
    setIsAuthenticated(false);
    navigate("/login");
  };
  const goToProfile = () => {
    setIsDropdownOpen(false);
    navigate("/userprofile");
  };
  const filteredCourses = courses
    .filter((course) => {
      const titleMatch = course.title
        .toLowerCase()
        .includes(filter.toLowerCase());
      const tutorMatch = course.tutor?.fullname
        ?.toLowerCase()
        .includes(filter.toLowerCase());
      const priceMatch =
        course.price >= priceRange[0] && course.price <= priceRange[1];

      return (titleMatch || tutorMatch) && priceMatch;
    })
    .sort((a, b) => {
      if (sortOption === "asc") return a.price - b.price;
      if (sortOption === "desc") return b.price - a.price;
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-teal-500 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold">Welcome to MultiCourse
          </h1>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4 relative">
                <span className="text-lg font-bold">
                  Hello,{" "}
                  <span
                    className="font-semibold text-yellow-300 cursor-pointer hover:text-teal-400 hover:scale-105 transition-transform duration-200"
                    onClick={toggleDropdown}
                  >
                    {fullname}
                  </span>
                  !
                </span>
                {isDropdownOpen && (
                  <div
                    ref={dropdownRef} // Tham chiếu tới dropdown
                    className="absolute top-full mt-2 w-48 bg-white rounded-lg shadow-lg z-50"
                  >
                    <ul className="py-2">
                      <li
                        onClick={goToProfile}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                      >
                        Profile
                      </li>
                      <li
                        onClick={goToCart}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                      >
                        Your Cart
                      </li>

                      {/* Đường gạch ngang */}
                      <div className="border-t border-gray-300 my-0"></div>
                      <li
                        onClick={handleLogout}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                      >
                        Logout
                      </li>
                    </ul>
                  </div>
                )}
              </div>
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
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          Marketing Articles
        </h2>

        <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Filter by Course Name or Tutor */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 Search by course or tutor name..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="w-32">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full p-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="default">Sort by</option>
                <option value="asc">Price Low to High</option>
                <option value="desc">Price High to Low</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div className="w-32">
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(Number(e.target.value))}
                className="w-full p-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value={0}>All Ratings</option>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <option key={rating} value={rating}>
                    {Array.from({ length: rating }).map((_, idx) => (
                      <span key={idx}>★</span>
                    ))}{" "}
                    {rating} Star{rating > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div className="flex-1">
              <p className="text-gray-800 text-center font-semibold mb-2">
                Price: ${priceRange[0]} - ${priceRange[1]}
              </p>
              <Slider
                range
                min={0}
                max={1000}
                value={priceRange}
                onChange={(value) => setPriceRange(value)}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          {loading ? (
            <p>Đang tải danh sách khóa học...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
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

                      {/* Hiển thị tên giảng viên */}
                      <p className="text-sm text-gray-600 mt-2">
                        Tutor: {course.tutor?.fullname}
                      </p>
                      <p className="text-gray-600 mt-2">{course.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-teal-700 font-bold">
                          ${course.price}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(course._id);
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
                <p>There are no courses currently available.</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomeScreen;
