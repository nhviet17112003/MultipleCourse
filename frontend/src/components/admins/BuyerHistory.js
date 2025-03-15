import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table } from "antd";

export default function BuyerHistory() {
  const [BuyerHistory, setBuyerHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchBuyerHistory = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/orders/all-purchase-course",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setBuyerHistory(res.data);
        console.log("Buyer:", res.data);

        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };
    fetchBuyerHistory();
  }, []);

  if (loading)
    return (
      <div className="text-center text-lg font-semibold mt-4">Loading...</div>
    );
  if (error)
    return <div className="text-red-500 text-center mt-4">{error.message}</div>;

  const columns = [
    {
      title: "Buyer Email",
      dataIndex: "buyerEmail",
      key: "buyerEmail",
      // render: (buyerEmail) => (
      //   <div className="text-red-500">
      //      {buyerEmail}
      //   </div>
      // )
    },
    {
      title: "Course Name",
      dataIndex: "courseName",
      key: "courseName",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "Order Date",
      dataIndex: "orderDate",
      key: "orderDate",
    },
  ];
  const data = BuyerHistory.map((order, index) => ({
    key: index,
    buyerEmail: order.buyers.map((buyer) => buyer.email),
    courseName: order.course.title,
    price: order.course.price + " VND",
    orderDate: new Date(order.course.date).toLocaleDateString(),
  }));

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        Buyer History
      </h1>
      <div className="overflow-x-auto">
        <Table columns={columns} dataSource={data} />            
        {/* <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-teal-600 text-white">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">Buyer Email</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Course Name</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Price</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Order Date</th>
            </tr>
          </thead>
          <tbody>
            {BuyerHistory.map((order) => (
              <tr
                key={order._id}
                className="border-b hover:bg-gray-100 transition"
              >
                <td className="border border-gray-300 px-4 py-2">
                  {order.buyers.map((buyer, index) => (
                    <div key={index} className="text-gray-700">
                      {buyer.email}
                    </div>
                  ))}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-gray-700">
                  {order.course.title}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-gray-700">
                  {order.course.price} VND
                </td>
                <td className="border border-gray-300 px-4 py-2 text-gray-700">
                  {new Date(order.course.date).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table> */}
      </div>
    </div>
  );
}
