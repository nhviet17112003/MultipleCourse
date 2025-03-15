import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table } from "antd";

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

  const columns = [
    {
      title: "Buyer",
      dataIndex: "buyer",
      key: "buyer",
      render: (buyer) => <a>{buyer}</a>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email) => <a>{email}</a>,
    },
    {
      title: "Course",
      dataIndex: "course",
      key: "course",
      render: (course) => <a>{course}</a>,
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (total) => <a>{total}</a>,
    },
    {
      title: "Order Date",
      dataIndex: "order_date",
      key: "order_date",
      render: (order_date) => <a>{order_date}</a>,
    },
  ];

  const data = orders.map((order, index) => ({
    key: index,
    buyer: order.user?.fullname || "N/A",
    email: order.user?.email || "N/A",
    course: order.order_items
      .map((item) => item.course?.title)
      .join(", ") || "N/A",
    total: order.total_price.toLocaleString() + " VND",
    order_date: new Date(order.order_date).toLocaleDateString(),
  }));

  return (
    <div className="container mx-auto p-6 max-h-screen">
      <h2 className="text-3xl font-bold text-center mb-6">Purchase History</h2>
      <Table columns={columns} dataSource={data} />
      {/* <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-teal-600 text-white">
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
      </table> */}
    </div>
  );
};

export default PurchaseHistoryForAdmin;
