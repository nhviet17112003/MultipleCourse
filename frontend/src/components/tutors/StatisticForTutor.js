import { useEffect, useState } from "react";
import axios from "axios";

export default function TutorEarnings() {
  const [totalEarning, setTotalEarning] = useState(null);
  const [courseEarnings, setCourseEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchCourseEarnings = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/orders/total-earning-from-course",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCourseEarnings(res.data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };
    fetchCourseEarnings();
  }, []);

  if (loading)
    return (
      <div className="text-center text-lg font-semibold mt-4 text-gray-700">
        Đang tải...
      </div>
    );
  if (error)
    return (
      <div className="text-red-500 text-center mt-4">{error.message}</div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        Thu nhập từ các khóa học
      </h2>
      {courseEarnings.length > 0 ? (
        <ul className="space-y-4">
          {courseEarnings.map((course) => (
            <li
              key={course.course_id}
              className="p-4 bg-gray-100 rounded-lg shadow-md flex justify-between items-center"
            >
              <span className="text-lg font-medium text-gray-700">
                Khóa học {course.course_id}
              </span>
              <span className="text-green-600 font-bold">
                ${course.totalIncome} ({course.totalSales} lượt bán)
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500">Không có dữ liệu thu nhập từ khóa học.</p>
      )}
    </div>
  );
}
