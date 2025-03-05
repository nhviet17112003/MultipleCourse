import React, { useEffect, useState } from "react";
import axios from "axios";

const CourseListForAdmin = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const response = await axios.get(
          "http://localhost:3000/api/courses/all-courses",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log(response.data);
        setCourses(response.data);
      } catch (err) {
        setError("Error loading course list.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const toggleCourseStatus = async (courseId) => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.put(
        `http://localhost:3000/api/courses/change-course-status/${courseId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data.message);
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course._id === courseId
            ? { ...course, status: !course.status }
            : course
        )
      );
    } catch (err) {
      alert("Error changing course status.");
    }
  };

  if (loading) return <p className="text-center text-gray-600">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-teal-700 text-center mb-6">
        List of Courses
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-teal-700 text-white">
            <tr>
              {/* <th className="p-4">ID</th> */}
              <th className="p-4">Course Name</th>
              {/* <th className="p-4">Mô tả</th> */}
              <th className="p-4">Tutor Name</th>
              <th className="p-4">Status</th>
              <th className="p-4">Press</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr
                key={course._id}
                className="border-b text-center hover:bg-gray-100"
              >
                {/* <td className="p-4">{course._id}</td> */}
                <td className="p-4 font-semibold text-gray-700">
                  <a href={`/courses-list-for-admin/${course._id}`}>
                    {course.title}
                  </a>
                </td>
                {/* <td className="p-4 text-gray-600">{course.description}</td> */}
                <td className="p-4 text-gray-600">{course.tutor.fullname}</td>
                <td
                  className={`p-4 font-bold ${
                    course.status ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {course.status ? "Active" : "Inactive"}
                </td>
                <td className="p-4">
                  <button
                    onClick={() => toggleCourseStatus(course._id)}
                    className={`px-4 py-2 text-white rounded-lg font-semibold transition-all duration-300 ${
                      course.status
                        ? "bg-red-500 hover:bg-red-700"
                        : "bg-green-500 hover:bg-green-700"
                    }`}
                  >
                    {course.status ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourseListForAdmin;
