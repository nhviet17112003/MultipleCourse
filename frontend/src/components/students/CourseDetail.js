import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const DetailCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullname, setFullname] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  if (loading) {
    return <p className="text-center text-lg font-medium text-gray-700 mt-10">Đang tải thông tin khóa học...</p>;
  }

  if (!course) {
    return <p className="text-center text-lg font-medium text-gray-700 mt-10">Không tìm thấy khóa học.</p>;
  }

  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto px-4">
        <div className="bg-white shadow-2xl rounded-xl overflow-hidden md:grid md:grid-cols-2 md:gap-8 p-8">
          <div className="md:flex md:justify-center md:items-center">
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-72 object-cover rounded-xl shadow-lg transform hover:scale-105 transition duration-300"
            />
          </div>
          <div className="mt-4 md:mt-0">
            <h2 className="text-4xl font-bold text-teal-700">{course.title}</h2>
            <p className="text-lg text-gray-600 mt-2 italic">Danh mục: {course.category}</p>
            <p className="mt-4 text-gray-700 leading-relaxed">{course.description}</p>
            <div className="mt-6 flex justify-between items-center">
              <p className="text-3xl text-teal-800 font-bold">${course.price}</p>
              <p className="text-sm text-gray-500 italic">
                Ngày tạo: {new Date(course.createAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Bình luận */}
        <div className="mt-12 bg-white shadow-lg rounded-xl p-6">
          <h3 className="text-2xl font-semibold text-teal-600">Comments:</h3>

          {course.comments && course.comments.length > 0 ? (
            <div className="mt-4 space-y-4">
              {course.comments.map((comment) => (
                <div
                  key={comment._id}
                  className="p-4 bg-gray-50 rounded-lg shadow-sm flex gap-4 items-center"
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-teal-500 text-white font-semibold rounded-full">
                    {comment.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{comment.author}</p>
                    <p className="text-gray-700">{comment.comment}</p>
                    <p className="text-sm text-gray-500">{new Date(comment.date).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 mt-4">No comment.</p>
          )}
        </div>

        {/* Nút quay lại */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate(-1)}
            className="bg-teal-600 text-white py-3 px-8 rounded-lg shadow-md text-lg font-semibold hover:bg-teal-700 transition duration-300"
          >
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailCourse;
