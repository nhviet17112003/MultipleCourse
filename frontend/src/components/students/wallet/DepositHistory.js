import React, { useState, useEffect } from "react";
import axios from "axios";

const DepositHistory = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");

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

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
    setCurrentPage(1);
  };

  let filteredDeposits = [...deposits];

  if (selectedDate) {
    const selectedDateObj = new Date(selectedDate);
    filteredDeposits = filteredDeposits.filter(
      (d) => new Date(d.payment_date) >= selectedDateObj
    );
  }

  if (sortOrder === "asc") {
    filteredDeposits.sort((a, b) => a.payment_amount - b.payment_amount);
  } else if (sortOrder === "desc") {
    filteredDeposits.sort((a, b) => b.payment_amount - a.payment_amount);
  }

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
    <div className="justify-start items-start min-h-screen bg-gradient-to-b from-[#14b8a6] to-indigo-200 flex pt-10">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 w-full max-w-6xl bg-white shadow-lg rounded-lg ">
        <h1 className="text-3xl font-bold text-black-500 mb-4 text-center">
          Deposit History
        </h1>

        <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-2 md:space-y-0 md:space-x-4">
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="border px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-full md:w-auto"
          />

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-4 py-2 border rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-full md:w-auto"
          >
            <option value="all">All</option>
            <option value="asc">Low to High</option>
            <option value="desc">High to Low</option>
          </select>
        </div>

        {displayedDeposits.length === 0 ? (
          <div className="text-center text-gray-500 text-xl mt-6">
            No deposit history
          </div>
        ) : (
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
                    <td className="px-4 py-2 border">
                      {deposit.payment_amount} VNĐ
                    </td>
                    <td className="px-4 py-2 border">
                      {new Date(deposit.payment_date).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 text-xl font-bold text-right text-gray-700">
          Total:{" "}
          <span className="text-green-600">{totalPaymentAmount} VNĐ</span>
        </div>

        <div className="flex justify-center mt-4 space-x-2 flex-wrap">
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
    </div>
  );
};

export default DepositHistory;
