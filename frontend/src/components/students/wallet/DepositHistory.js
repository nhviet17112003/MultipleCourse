import React, { useState, useEffect } from "react";
import axios from "axios";

const DepositHistory = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("asc"); // Sắp xếp theo payment_amount
  const [filterDays, setFilterDays] = useState(null);

  const itemsPerPage = 15;

  useEffect(() => {
    const fetchDepositHistory = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          "http://localhost:3000/api/wallet/deposit-history",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.status === 200) {
          setDeposits(response.data.deposits);
        } else {
          setError("Không thể lấy lịch sử nạp tiền");
        }
      } catch (error) {
        setError("Lỗi khi lấy lịch sử nạp tiền");
      } finally {
        setLoading(false);
      }
    };

    fetchDepositHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="spinner-border animate-spin w-8 h-8 border-4 rounded-full text-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-500">{error}</h1>
          <button
            className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => window.location.reload()}
          >
            Tải lại
          </button>
        </div>
      </div>
    );
  }

  // 🏷️ Filter theo ngày
  const filterDepositsByDate = (days) => {
    setFilterDays(days);
    setCurrentPage(1);
  };

  let filteredDeposits = [...deposits];

  if (filterDays) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - filterDays);
    filteredDeposits = filteredDeposits.filter(
      (d) => new Date(d.payment_date) >= cutoffDate
    );
  }

  filteredDeposits.sort((a, b) => {
    return sortOrder === "asc"
      ? a.payment_amount - b.payment_amount
      : b.payment_amount - a.payment_amount;
  });

  const totalPaymentAmount = filteredDeposits.reduce(
    (total, deposit) => total + deposit.payment_amount,
    0
  );

  const totalPages = Math.ceil(filteredDeposits.length / itemsPerPage);
  const displayedDeposits = filteredDeposits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-teal-500 mb-4 text-center">
        Deposit History
      </h1>

      <div className="flex justify-between mb-4">
        <div className="space-x-2">
          <button
            onClick={() => filterDepositsByDate(1)}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            1 Day
          </button>
          <button
            onClick={() => filterDepositsByDate(3)}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            3 Day
          </button>
          <button
            onClick={() => filterDepositsByDate(7)}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            7 Day
          </button>
          <button
            onClick={() => setFilterDays(null)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            All
          </button>
        </div>

        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          {sortOrder === "asc" ? "Low to High" : "High to Low"}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead className="bg-teal-500 text-white">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {displayedDeposits.map((deposit) => (
              <tr key={deposit._id} className="bg-white hover:bg-gray-100">
                <td className="px-4 py-2 border">{deposit.order_code}</td>
                <td className="px-4 py-2 border">{deposit.description}</td>
                <td className="px-4 py-2 border">{deposit.payment_amount}</td>
                <td className="px-4 py-2 border">
                  {new Date(deposit.payment_date).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔢 Hiển thị tổng tiền */}
      <div className="mt-4 text-xl font-bold text-right text-gray-700">
        Tổng tiền: <span className="text-blue-600">{totalPaymentAmount}</span>
      </div>

      {/* 🔀 Phân trang */}
      <div className="flex justify-center mt-4 space-x-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-4 py-2 rounded-lg ${
              currentPage === i + 1
                ? "bg-teal-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DepositHistory;
