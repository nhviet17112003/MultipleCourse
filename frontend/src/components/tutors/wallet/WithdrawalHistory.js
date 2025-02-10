import React, { useEffect, useState } from "react";

const WithdrawalHistory = () => {
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWithdrawalHistory = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/wallet/requests-history",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch withdrawal history");
        }

        const data = await response.json();
        setWithdrawalHistory(data.withdrawals || []);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchWithdrawalHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner-border animate-spin inline-block w-12 h-12 border-4 border-t-4 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto my-8 px-6 py-4 bg-white shadow-xl rounded-lg">
      <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
        Withdrwal History
      </h1>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto bg-gray-50 shadow-md rounded-lg">
          <thead>
            <tr className="text-left bg-gray-200 text-gray-700">
              <th className="py-3 px-6">Date & Time</th>
              <th className="py-3 px-6">Amount</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6">Transaction ID</th>
            </tr>
          </thead>
          <tbody>
            {withdrawalHistory.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  No withdrawal history
                </td>
              </tr>
            ) : (
              withdrawalHistory.map((request, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-100 transition-all duration-300"
                >
                  <td className="py-3 px-6 text-sm text-gray-700">
                    {/* Định dạng ngày giờ theo kiểu dd/mm/yyyy HH:mm:ss */}
                    {new Date(request.date).toLocaleString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    })}
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-700">
                    {request.amount.toLocaleString("vi-VN")} VNĐ
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-700">
                    <span
                      className={`${
                        request.status === "Pending"
                          ? "bg-yellow-200 text-yellow-600"
                          : "bg-green-200 text-green-600"
                      } py-1 px-4 rounded-full text-sm`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-700">
                    {request._id}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WithdrawalHistory;
