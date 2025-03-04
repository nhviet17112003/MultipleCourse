import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import UpdateCourseModal from "./UpdateCourseModal"; // Import modal
import { useTheme } from "../context/ThemeContext"; // Import context
import { Button, Spin, Breadcrumb } from "antd";
import { HomeOutlined, UserOutlined } from "@ant-design/icons";

const CourseListForTutor = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [percent, setPercent] = useState(0);
  const token = localStorage.getItem("authToken");
  const { theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    setSpinning(true);
    let ptg = -10;
    const interval = setInterval(() => {
      ptg += 5;
      setPercent(ptg);
      if (ptg > 120) {
        clearInterval(interval);
        setSpinning(false);
        setPercent(0);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchTutorCourses = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setErrorMessage("Please log in to view your courses.");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:3000/api/courses/course-of-tutor",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          setCourses(response.data);
        }
      } catch (error) {
        setErrorMessage(
          error.response?.data?.message ||
            "An error occurred while fetching courses."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTutorCourses();
  }, [navigate]);

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      const response = await axios.delete(
        `http://localhost:3000/api/courses/delete-course/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        alert("Course deleted successfully!");
        setCourses((prevCourses) =>
          prevCourses.filter((course) => course._id !== courseId)
        );
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      alert(error.response?.data?.message || "Failed to delete course.");
    }
  };

  const handleOpenModal = (course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedCourse(null);
    setIsModalOpen(false);
  };

  const handleUpdateCourse = async (updatedCourse) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.put(
        `http://localhost:3000/api/courses/update-course/${updatedCourse._id}`,
        updatedCourse,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setCourses((prevCourses) =>
          prevCourses.map((course) =>
            course._id === updatedCourse._id ? response.data : course
          )
        );
        handleCloseModal();
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "An error occurred while updating the course."
      );
    }
  };

  const handleUpdateImage = async (courseId, imageFile) => {
    const token = localStorage.getItem("authToken");
    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      const response = await axios.put(
        `http://localhost:3000/api/courses/update-course-image/${courseId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        setCourses((prevCourses) =>
          prevCourses.map((course) =>
            course._id === courseId ? response.data : course
          )
        );
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "An error occurred while updating the image."
      );
    }
  };

  return (
    <div
      className={`course-list-tutor p-6 h-full ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      <Spin spinning={spinning} fullscreen />
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Course List</h1>
      {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
      {loading ? (
        <p className="text-lg">Loading courses...</p>
      ) : courses.length > 0 ? (
        <div className="space-y-6">
          {courses.map((course) => (
            <div
              key={course._id}
              className={`flex items-center rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="ml-6 flex-1">
                <h2 className="text-xl font-semibold text-teal-600">
                  {course.title}
                </h2>
                <p className="text-sm text-gray-500 mt-1">{course.category}</p>
                <p className="text-gray-700 mt-2 line-clamp-2">
                  {course.description}
                </p>
                <p className="text-teal-700 font-bold mt-2">${course.price}</p>
                <p
                  className={`mt-2 font-bold ${
                    course.status ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {course.status ? "Available" : "Not Available"}
                </p>
              </div>
              <div className="ml-auto flex space-x-4">
                <input
                  type="file"
                  onChange={(e) =>
                    handleUpdateImage(course._id, e.target.files[0])
                  }
                  className="hidden"
                  id={`upload-image-${course._id}`}
                />
                <label
                  htmlFor={`upload-image-${course._id}`}
                  className="bg-teal-500 text-white py-2 px-4 rounded hover:bg-teal-600 transition-all cursor-pointer"
                >
                  Update Image
                </label>
                <button
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-all"
                  onClick={() => handleOpenModal(course)}
                >
                  Update Info
                </button>

                <button
                  className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-all"
                  onClick={() => handleDeleteCourse(course._id)}
                >
                  Delete
                </button>

                <button
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-all"
                  onClick={() => navigate(`/courses-list-tutor/${course._id}`)} // Thêm chức năng điều hướng đến chi tiết khóa học
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-lg font-medium text-gray-600 mt-4">
          You have no courses at the moment.
        </p>
      )}

      {isModalOpen && selectedCourse && (
        <UpdateCourseModal
          course={selectedCourse}
          onClose={handleCloseModal}
          onUpdate={handleUpdateCourse}
        />
      )}
    </div>
  );
};

export default CourseListForTutor;
