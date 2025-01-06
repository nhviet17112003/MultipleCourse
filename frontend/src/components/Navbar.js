import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [fullname, setFullname] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login"); // Chuyển về trang đăng nhập nếu không có token
    } else {
      const savedFullname = localStorage.getItem("fullname");
      setFullname(savedFullname || "Người dùng");
    }
  }, [navigate]);

  const goToUserProfile = () => {
    navigate("/userprofile"); // Điều hướng đến trang UserProfile
  };

  const goToCreateCourse = () => {
    navigate("/createcourse"); // Điều hướng đến trang Create Course
  };

  const goToCourseList = () => {
    navigate("/tutor/courselist"); // Điều hướng đến danh sách khóa học
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("fullname");
    navigate("/login");
  };

  return (
    <nav className="bg-teal-500 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1
          className="text-xl font-bold cursor-pointer hover:text-yellow-300"
          onClick={() => navigate("/")}
        >
          Welcome to Lorem
        </h1>

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
            onClick={goToCourseList}
          >
            Course List
          </button>

          <button
            className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
