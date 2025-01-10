import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useTheme } from "../context/ThemeContext"; // Import theme context

const CourseDetailForTutor = () => {
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme(); // Get the theme from context

  useEffect(() => {
    const fetchCourseDetail = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setErrorMessage("Please log in to view the course details.");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:3000/api/courses/detail/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          setCourse(response.data.courseDetail);
          setLessons(response.data.lessons);
        }
      } catch (error) {
        setErrorMessage(
          error.response?.data?.message || "An error occurred while fetching course details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [courseId, navigate]);

  if (loading) {
    return <p>Loading course details...</p>;
  }

  if (errorMessage) {
    return <p className="text-red-500">{errorMessage}</p>;
  }

  return (
    <div className={`course-detail p-6 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Course Details</h1>
      {course && (
        <div className={`bg-white rounded-lg shadow-md p-6 ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
          {course.image && (
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-[500px] object-cover rounded-lg"
            />
          )}

          <h2 className="text-xl font-semibold text-teal-600 mt-4">{course.title}</h2>
          <p className="text-sm text-gray-500 mt-1">{course.category}</p>
          <p className="text-gray-700 mt-2">{course.description}</p>
          <p className="text-teal-700 font-bold mt-2">${course.price}</p>
          <p className={`mt-2 font-bold ${course.status ? "text-green-600" : "text-red-600"}`}>
            {course.status ? "Available" : "Not Available"}
          </p>
        </div>
      )}

      {lessons.length > 0 ? (
        <div className="lessons mt-6">
          <h3 className="text-xl font-semibold text-gray-800">Lessons</h3>
          <ul>
            {lessons.map((lesson, index) => (
              <li key={index} className={`bg-white p-4 rounded-lg shadow-md mt-4 ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
                <p className="font-semibold text-teal-600">{lesson.title}</p>
                <p className="text-gray-600">{lesson.description}</p>
                <button
                  onClick={() => navigate(`/lesson-detail/${lesson._id}`)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2"
                >
                  View Details
                </button>
                <button
                  onClick={() => navigate(`/update-lesson/${lesson._id}`)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg mt-2 ml-2"
                >
                  Update Lesson
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-4 text-gray-500">No lessons available for this course.</p>
      )}
      <button
        onClick={() => navigate(`/create-lesson/${courseId}`)}
        className="bg-teal-500 text-white px-4 py-2 rounded-lg mt-4"
      >
        Create Lesson
      </button>
    </div>
  );
};

export default CourseDetailForTutor;