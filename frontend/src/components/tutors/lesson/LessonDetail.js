import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";

const LessonDetail = () => {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLesson = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const response = await axios.get(
          `http://localhost:3000/api/lessons/${lessonId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setLesson(response.data);
      } catch (err) {
        setError("Failed to load lesson.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          theme === "dark" ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <p className="text-gray-500 text-lg font-medium animate-bounce">
          Loading...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          theme === "dark" ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <p className="text-red-500 text-lg font-medium">{error}</p>
      </div>
    );
  }

  return lesson ? (
    <div
      className={`min-h-screen flex items-center justify-center ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div
        className={`max-w-4xl w-full ${
          theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        } rounded-xl shadow-lg p-8`}
      >
        <div className="flex items-center justify-between border-b-2 border-teal-500 pb-4">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold flex-1 text-center">
            {lesson.title}
          </h1>
        </div>

        <p className="text-gray-500 mt-2">
          {new Date(lesson.created_at).toLocaleDateString("en-US", {
            month: "long",

            day: "2-digit",

            year: "numeric",
          })}
        </p>
        <p className="text-lg leading-relaxed mt-6">{lesson.description}</p>

        {lesson.video_url && (
          <div className="mt-8">
            {/* <h3 className="text-xl font-semibold">Video</h3> */}
            <video width="100%" controls>
              <source src={lesson.video_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {lesson.document_url && (
          <div className="mt-8">
            {/* <h3 className="text-xl font-semibold">Document</h3> */}
            <embed
              src={lesson.document_url}
              width="100%"
              height="600px"
              type="application/pdf"
            />
          </div>
        )}
      </div>
    </div>
  ) : (
    <div
      className={`min-h-screen flex items-center justify-center ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <p className="text-gray-500 text-lg font-medium">
        Loading lesson details...
      </p>
    </div>
  );
};

export default LessonDetail;
