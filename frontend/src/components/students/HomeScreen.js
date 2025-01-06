import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


const HomeScreen = () => {
  const navigate = useNavigate();
  const [fullname, setFullname] = useState("");
  const [courses, setCourses] = useState([]); // State lưu danh sách khóa học
  const [loading, setLoading] = useState(true); // State để quản lý trạng thái loading

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login"); // Chuyển về trang đăng nhập nếu không có token
    } else {
      const savedFullname = localStorage.getItem("fullname");
      setFullname(savedFullname || "Người dùng");
    }
  }, [navigate]);

  useEffect(() => {
    // Gọi API để lấy danh sách khóa học
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
          setCourses(data); // Lưu danh sách khóa học vào state
        } else {
          console.log("Error fetching courses:", data.message);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false); // Đảm bảo loading false sau khi fetch xong
      }
    };

    fetchCourses();
  }, []);

  const goToUserProfile = () => {
    navigate("/userprofile"); // Điều hướng đến trang UserProfile
  };
  const goToCreateCourse = () => {
    navigate("/createcourse"); // Điều hướng đến trang Create Course
  };

  const getCourseOfTutor = () => {
    navigate("/tutor/courselist"); // Điều hướng đến trang Create Course
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-teal-500 text-white shadow-md">
        {/* <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">Welcome to Lorem</h1>

          <div className="flex items-center space-x-4">
            <span className="text-lg">
              Xin chào,{" "}
              <span
                className="font-semibold text-yellow-300 cursor-pointer hover:text-teal-400 hover:scale-105 transition-transform duration-200"
                onClick={goToUserProfile}
              >
                {fullname}
              </span>
              !
            </span>

            <button
              className="bg-yellow-300 text-teal-900 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
              onClick={goToCreateCourse}
            >
              Create Course
            </button>

            <button
              className="bg-yellow-300 text-teal-900 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
              onClick={getCourseOfTutor}
            >
              Course List
            </button>
          </div>
        </div> */}
      </nav>
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          Marketing Articles
        </h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          {loading ? (
            <p>Đang tải danh sách khóa học...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {courses.length > 0 ? (
                courses.map((course) => (
                  <div
                    key={course._id}
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
                      </p>{" "}
                      {/* Category */}
                      <p className="text-gray-600 mt-2">{course.description}</p>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-teal-700 font-bold">
                          ${course.price}
                        </span>
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
