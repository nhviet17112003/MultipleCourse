import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

export default function TutorStatistics() {
  const [courseEarnings, setCourseEarnings] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [todayRevenue, setTodayRevenue] = useState(null);
  const [yearlyRevenue, setYearlyRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [courseRes, monthRes, todayRes, yearRes] = await Promise.all([
          axios.get("http://localhost:3000/api/orders/total-earning-from-course", { headers }),
          axios.get("http://localhost:3000/api/orders/revenue-month-tutor", { headers }),
          axios.get("http://localhost:3000/api/orders/revenue-day-tutor", { headers }),
          axios.get("http://localhost:3000/api/orders/revenue-year-tutor", { headers }),
        ]);

        setCourseEarnings(courseRes.data);
        setMonthlyRevenue(monthRes.data);
        setTodayRevenue(todayRes.data.totalRevenueToday);
        setYearlyRevenue(yearRes.data.totalRevenueThisYear);

        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

<<<<<<< HEAD
  if (loading)
    return (
      <div className="text-center text-lg font-semibold mt-4 text-gray-700">
        Đang tải...
      </div>
    );
  if (error)
    return <div className="text-red-500 text-center mt-4">{error.message}</div>;

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
        <p className="text-center text-gray-500">
          Không có dữ liệu thu nhập từ khóa học.
        </p>
      )}
=======
  if (loading) return <div className="text-center text-lg font-semibold mt-4 text-gray-700">Đang tải...</div>;
  if (error) return <div className="text-red-500 text-center mt-4">{error.message}</div>;

  // Màu sắc cho biểu đồ tròn
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#ff4d4f"];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-2xl rounded-2xl mt-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Tutor Statistics</h2>

      {/* Tổng doanh thu hôm nay & năm */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="p-4 bg-blue-50 border border-blue-300 rounded-xl shadow">
          <h3 className="text-lg font-semibold text-gray-700">Today Revenue</h3>
          <p className="text-2xl font-bold text-blue-600">{todayRevenue?.toLocaleString()} VND</p>
        </div>
        <div className="p-4 bg-green-50 border border-green-300 rounded-xl shadow">
          <h3 className="text-lg font-semibold text-gray-700">Yearly Revenue</h3>
          <p className="text-2xl font-bold text-green-600">{yearlyRevenue?.toLocaleString()} VND</p>
        </div>
      </div>

      {/* Biểu đồ doanh thu theo tháng */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Monthly Revenue</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyRevenue}>
            <XAxis dataKey="month" stroke="#555" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="#82ca9d" barSize={50} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Biểu đồ doanh thu theo khóa học */}
      {/* <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Course Earnings</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={courseEarnings} dataKey="totalIncome" nameKey="course_id" cx="50%" cy="50%" outerRadius={100}>
              {courseEarnings.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div> */}
>>>>>>> 38a00a27cfe90dc7e35089e2cdb144dec1cde7da
    </div>
  );
}
