import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Spin } from "antd";
import { FaShoppingCart } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import "react-toastify/dist/ReactToastify.css";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const CourseList = () => {
  const navigate = useNavigate();
  const [spinning, setSpinning] = useState(false);
  const [percent, setPercent] = useState(0);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [tutors, setTutors] = useState({});
  const [filter, setFilter] = useState("");
  const [sortOption, setSortOption] = useState("default");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} className="text-yellow-500" />);
      } else if (i - 0.5 === rating) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-500" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-gray-400" />);
      }
    }
    return <span className="inline-flex">{stars}</span>;
  };

  const ratingCounts = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((rating) => ({
    rating,
    count: courses.filter((course) => (course.average_rating ?? 0) >= rating)
      .length,
  }));

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        console.log("Fetching courses...");

        const authToken = localStorage.getItem("authToken");

        // Fetch danh sách khóa học mà không cần token
        const coursesResponse = await fetch(
          "http://localhost:3000/api/courses/active-courses",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}), // Chỉ thêm nếu có token
            },
          }
        );

        const coursesData = await coursesResponse.json();

        console.log("Courses data received:", coursesData);

        if (!coursesResponse.ok) {
          console.error("Error fetching courses:", coursesData.message);
          return;
        }

        let filteredCourses = coursesData;

        if (authToken) {
          // Nếu có token, fetch đơn hàng
          const ordersResponse = await fetch(
            "http://localhost:3000/api/orders/my-orders",
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
              },
            }
          );

          const ordersData = await ordersResponse.json();

          if (!ordersResponse.ok) {
            console.error("Error fetching orders:", ordersData.message);
            return;
          }

          const purchasedCourseIds = new Set(
            ordersData.flatMap((order) =>
              order.order_items.map((item) => item.course._id)
            )
          );

          filteredCourses = coursesData.filter(
            (course) => !purchasedCourseIds.has(course._id)
          );
        }

        setCourses(filteredCourses);

        const uniqueTutorIds = [
          ...new Set(filteredCourses.map((course) => course.tutorId)),
        ];

        console.log("Unique tutor IDs:", uniqueTutorIds);

        const tutorsData = {};
        await Promise.all(
          uniqueTutorIds.map(async (tutorId) => {
            if (tutorId) {
              console.log(`Fetching tutor data for ID: ${tutorId}`);
              const tutorResponse = await fetch(
                `http://localhost:3000/api/tutors/${tutorId}`
              );
              const tutorData = await tutorResponse.json();
              if (tutorResponse.ok) {
                console.log(
                  `Tutor data received for ID ${tutorId}:`,
                  tutorData
                );
                tutorsData[tutorId] = tutorData.fullname;
              } else {
                console.error(
                  `Error fetching tutor ${tutorId}:`,
                  tutorData.message
                );
              }
            }
          })
        );

        console.log("Tutors data:", tutorsData);
        setTutors(tutorsData);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        console.log("Fetch process completed.");
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
        toast.success("Add product to cart successfully", {
          position: "top-right",
          autoClose: 3000,
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
      toast.error("Error, please try again!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
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
      const ratingMatch = (course.average_rating ?? 0) >= ratingFilter;

      return (titleMatch || tutorMatch) && priceMatch && ratingMatch;
    })
    .sort((a, b) => {
      if (sortOption === "asc") return a.price - b.price;
      if (sortOption === "desc") return b.price - a.price;
      if (sortOption === "rating-asc")
        return (a.average_rating ?? 0) - (b.average_rating ?? 0);
      if (sortOption === "rating-desc")
        return (b.average_rating ?? 0) - (a.average_rating ?? 0);
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-100">
      <Spin spinning={spinning} fullscreen />

      <ToastContainer />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 Search by course or tutor name..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="w-32">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full p-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="default">Sort by</option>
                <option value="asc">Price Low to High</option>
                <option value="desc">Price High to Low</option>
                <option value="rating-asc">Rating Low to High</option>
                <option value="rating-desc">Rating High to Low</option>
              </select>
            </div>
            <div className="w-32">
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(Number(e.target.value))}
                className="w-full p-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value={0}>All Rating</option>
                {ratingCounts.map(({ rating, count }) => (
                  <option key={rating} value={rating}>
                    From {rating} ⭐ ({count})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <p className="text-gray-800 text-center font-semibold mb-2">
                Price: {priceRange[0]} -{" "}
                {priceRange[1] >= 100000 ? "All" : priceRange[1]}
              </p>
              <Slider
                range
                min={0}
                max={100000}
                step={1000}
                value={priceRange}
                onChange={(value) => {
                  if (value[1] >= 100000) {
                    setPriceRange([value[0], 100000]);
                  } else {
                    setPriceRange(value);
                  }
                }}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex flex-row-reverse items-center mt-4 gap-4">
            <button
              onClick={() => {
                setFilter("");
                setSortOption("default");
                setPriceRange([0, 100000]);
                setRatingFilter(0);
              }}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Reset
            </button>
            <p className="text-gray-800 text-sm italic">
              The result has {filteredCourses.length} courses
            </p>
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
                      <h4 className="text-lg font-semibold text-cyan-600">
                        {course.title}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1 italic">
                        {course.category}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        Tutor: {course.tutor?.fullname}
                      </p>
                      <p className="text-yellow-500 flex items-center">
                        {renderStars(course.average_rating)} (
                        {course.comments.length})
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-cyan-700 font-bold">
                          ${course.price}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(course._id);
                          }}
                          className="bg-cyan-500 text-white px-4 py-2 rounded hover:bg-cyan-600"
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

export default CourseList;
