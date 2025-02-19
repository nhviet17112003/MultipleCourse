import React, { useEffect, useState } from "react";
import axios from "axios";

const PurchaseHistoryForAdmin = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const response = await axios.get("http://localhost:3000/api/orders/all-orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(response.data);
      } catch (err) {
        setError("Lỗi khi tải danh sách đơn hàng.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Lịch sử giao dịch (Admin)</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2">Người mua</th>
            <th className="border border-gray-300 p-2">Email</th>
            <th className="border border-gray-300 p-2">Khóa học</th>
            <th className="border border-gray-300 p-2">Tổng tiền</th>
            <th className="border border-gray-300 p-2">Ngày đặt hàng</th>
            <th className="border border-gray-300 p-2">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id} className="text-center">
              <td className="border border-gray-300 p-2">{order.user?.name || "N/A"}</td>
              <td className="border border-gray-300 p-2">{order.user?.email || "N/A"}</td>
              <td className="border border-gray-300 p-2">
                {order.order_items.map((item) => item.course?.title).join(", ") || "N/A"}
              </td>
              <td className="border border-gray-300 p-2">{order.total_price.toLocaleString()} VNĐ</td>
              <td className="border border-gray-300 p-2">{new Date(order.order_date).toLocaleDateString()}</td>
              <td className={`border border-gray-300 p-2 font-bold 
                  ${order.status === "Success" ? "text-green-600" : 
                    order.status === "Failed" ? "text-red-600" : "text-yellow-600"}`}>
                {order.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PurchaseHistoryForAdmin;
