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
        const response = await axios.get(
          "http://localhost:3000/api/orders/all-orders",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setOrders(response.data);
      } catch (err) {
        setError("Error loading order list.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <p>Loading data...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Purchase History (Admin)</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2">Buyer</th>
            <th className="border border-gray-300 p-2">Email</th>
            <th className="border border-gray-300 p-2">Course</th>
            <th className="border border-gray-300 p-2">Total</th>
            <th className="border border-gray-300 p-2">Order Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id} className="text-center">
              <td className="border border-gray-300 p-2">
                {order.user?.fullname || "N/A"}
              </td>
              <td className="border border-gray-300 p-2">
                {order.user?.email || "N/A"}
              </td>
              <td className="border border-gray-300 p-2">
                {order.order_items
                  .map((item) => item.course?.title)
                  .join(", ") || "N/A"}
              </td>
              <td className="border border-gray-300 p-2">
                {order.total_price.toLocaleString()} VND
              </td>
              <td className="border border-gray-300 p-2">
                {new Date(order.order_date).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PurchaseHistoryForAdmin;
