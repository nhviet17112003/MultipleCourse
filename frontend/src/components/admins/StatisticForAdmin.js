import React, { useEffect, useState } from "react";

const StatisticForAdmin = () => {
  
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [revenueToday, setRevenueToday] = useState(0);
  const [revenueYear, setRevenueYear] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
console.log(orders)


  const fetchData = async (url, setState) => {
    try {
  
      const token = localStorage.getItem("authToken");
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setState(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData("http://localhost:3000/api/orders/revenue", (data) => setTotalRevenue(data.totalRevenue));
    fetchData("http://localhost:3000/api/orders/revenue-day", (data) => setRevenueToday(data.totalRevenueToday));
    fetchData("http://localhost:3000/api/orders/revenue-year", (data) => setRevenueYear(data.totalRevenueThisYear));
    fetchData("http://localhost:3000/api/orders/revenue-each-month", setMonthlyRevenue);
    fetchData("http://localhost:3000/api/orders/all-orders", setOrders);
    
    setLoading(false);
  }, []);

 

  if (loading) {
    return <p className="text-center text-gray-600">Đang tải dữ liệu...</p>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold text-teal-600">Thống kê doanh thu</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white p-6 shadow rounded-lg text-center">
          <h2 className="text-xl font-semibold text-gray-700">Tổng doanh thu</h2>
          <p className="text-2xl text-teal-600">${totalRevenue}</p>
        </div>
        <div className="bg-white p-6 shadow rounded-lg text-center">
          <h2 className="text-xl font-semibold text-gray-700">Doanh thu hôm nay</h2>
          <p className="text-2xl text-teal-600">${revenueToday}</p>
        </div>
        <div className="bg-white p-6 shadow rounded-lg text-center">
          <h2 className="text-xl font-semibold text-gray-700">Doanh thu năm nay</h2>
          <p className="text-2xl text-teal-600">${revenueYear}</p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-700 mt-8">Doanh thu theo tháng</h2>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-4">
        {monthlyRevenue.map(({ month, revenue }) => (
          <div key={month} className="bg-gray-100 p-4 rounded-lg text-center">
            <p className="text-teal-700 font-bold">Tháng {month}</p>
            <p className="text-gray-600">${revenue}</p>
          </div>
        ))}
      </div>




      <h2 className="text-2xl font-semibold text-gray-700 mt-8">Danh sách đơn hàng</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-teal-600 text-white">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Người mua</th>
              <th className="p-4">Số tiền</th>
              <th className="p-4">Ngày đặt</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-b text-center">
                <td className="p-4">{order._id}</td>
                <td className="p-4">{order.user?.fullname || "Ẩn danh"}</td>
                <td className="p-4">${order.total_price}</td>
                <td className="p-4">{new Date(order.order_date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StatisticForAdmin;