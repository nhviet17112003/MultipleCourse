import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CourseListForTutor = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTutorCourses = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setErrorMessage("Please log in to view your courses.");
        setTimeout(() => {
          navigate("/login");
        }, 2000); // Chuyển hướng sau 2 giây
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
          error.response?.data?.message || "An error occurred while fetching courses."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTutorCourses();
  }, [navigate]);

  return (
    <div className="course-list-tutor">
      <h1>Your Courses</h1>
      {errorMessage && <p className="error">{errorMessage}</p>}
      {loading ? (
        <p>Loading courses...</p>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div
              key={course._id}
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-bold text-teal-600">{course.title}</h2>
              <p className="text-sm text-gray-500 mt-1">{course.category}</p>
              <p className="text-gray-600 mt-2">{course.description}</p>
              <p className="text-teal-700 font-bold mt-2">${course.price}</p>
              <button
                className="mt-4 bg-teal-500 text-white py-2 px-4 rounded hover:bg-teal-600"
                onClick={() => navigate(`/courses/${course._id}`)}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>You have no courses at the moment.</p>
      )}
    </div>
  );
};

export default CourseListForTutor;
