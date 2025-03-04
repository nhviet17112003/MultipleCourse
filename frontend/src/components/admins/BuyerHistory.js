import React, { useState, useEffect } from "react";
import axios from "axios";

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

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Buyer History
      </h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="py-3 px-4 text-left">Buyer Email</th>
              <th className="py-3 px-4 text-left">Course Name</th>
              <th className="py-3 px-4 text-left">Price</th>
              <th className="py-3 px-4 text-left">Order Date</th>
            </tr>
          </thead>
          <tbody>
            {BuyerHistory.map((order) => (
              <tr
                key={order._id}
                className="border-b hover:bg-gray-100 transition"
              >
                <td className="py-3 px-4">
                  {order.buyers.map((buyer, index) => (
                    <div key={index} className="text-gray-700">
                      {buyer.email}
                    </div>
                  ))}
                </td>
                <td className="py-3 px-4 text-gray-700">
                  {order.course.title}
                </td>
                <td className="py-3 px-4 text-gray-700">
                  {order.course.price} VND
                </td>
                <td className="py-3 px-4 text-gray-700">
                  {new Date(order.course.date).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
