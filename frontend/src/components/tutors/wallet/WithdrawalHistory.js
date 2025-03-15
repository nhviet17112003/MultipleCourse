import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const WithdrawalHistory = () => {
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalWithdrawals, setTotalWithdrawals] = useState(0);
  const [showChart, setShowChart] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

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
        setTotalWithdrawals(data.withdrawals.length);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchWithdrawalHistory();
  }, []);

  const filteredData = withdrawalHistory.filter((item) => {
    const itemDate = new Date(item.date).toISOString().split("T")[0];
    return (
      (!filterStatus || item.status === filterStatus) &&
      (!selectedDate || itemDate === selectedDate)
    );
  });
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortField === "amount") {
      return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount;
    } else {
      return sortOrder === "asc"
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date);
    }
  });

  const totalApprovedAmount = sortedData
    .filter((item) => item.status === "Approved")
    .reduce((acc, item) => acc + item.amount, 0);

  const totalRejectedAmount = withdrawalHistory
    .filter((item) => item.status === "Rejected")
    .reduce((acc, item) => acc + item.amount, 0);

  const totalAmount = withdrawalHistory.reduce(
    (acc, item) => acc + item.amount,
    0
  );

  const chartData = [
    {
      name: "Approved",
      amount: withdrawalHistory
        .filter((item) => item.status === "Approved")
        .reduce((acc, item) => acc + item.amount, 0),
    },
    {
      name: "Rejected",
      amount: withdrawalHistory
        .filter((item) => item.status === "Rejected")
        .reduce((acc, item) => acc + item.amount, 0),
    },
    {
      name: "Pending",
      amount: withdrawalHistory
        .filter((item) => item.status === "Pending")
        .reduce((acc, item) => acc + item.amount, 0),
    },
    {
      name: "Total",
      amount: withdrawalHistory.reduce((acc, item) => acc + item.amount, 0),
    },
  ];

  const getTotalAmountByStatus = () => {
    if (filterStatus === "Approved") {
      return {
        label: "Total Approved Amount",
        amount: filteredData.reduce((acc, item) => acc + item.amount, 0),
      };
    }
    if (filterStatus === "Rejected") {
      return {
        label: "Total Rejected Amount",
        amount: filteredData.reduce((acc, item) => acc + item.amount, 0),
      };
    }
    if (filterStatus === "Pending") {
      return {
        label: "Total Pending Amount",
        amount: filteredData.reduce((acc, item) => acc + item.amount, 0),
      };
    }
    return {
      label: "Total Amount Request",
      amount: withdrawalHistory.reduce((acc, item) => acc + item.amount, 0),
    };
  };

  const { label, amount } = getTotalAmountByStatus();

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto my-8 px-6 py-4 bg-white shadow-xl rounded-lg">
      <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
        Withdrawal History
      </h1>

      <div className="flex justify-between items-center mb-4">
        <select
          className="border px-3 py-2 rounded-md"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Rejected">Rejected</option>
          <option value="Approved">Approved</option>
        </select>

        <div className="flex flex-wrap items-center gap-2">
          <select
            className="border px-3 py-2 rounded-md"
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
          >
            <option value="date">Date & Time</option>
            <option value="amount">Amount</option>
          </select>

          <button
            className="border px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? "▲ Ascending" : "▼ Descending"}
          </button>

          <div className="flex items-center gap-2">
            <label className="text-gray-700">Filter by Date:</label>
            <input
              type="date"
              className="border px-3 py-2 rounded-md"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <button
            className="border px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
            onClick={() => {
              setFilterStatus("");
              setSelectedDate("");
              setSortField("date");
              setSortOrder("desc");
              setCurrentPage(1);
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-500 italic mb-4">
        Number of withdrawal orders: {filteredData.length}
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto bg-gray-50 shadow-md rounded-lg">
          <thead>
            <tr className="text-left bg-[#14b8a6] text-white">
              <th className="py-3 px-6">Date & Time</th>
              <th className="py-3 px-6">Amount</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6">Transaction ID</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  No withdrawal history
                </td>
              </tr>
            ) : (
              paginatedData.map((request, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-100 transition-all duration-300"
                >
                  <td className="py-3 px-6 text-sm text-gray-700">
                    {new Date(request.date).toLocaleString("vi-VN")}
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-700">
                    {request.amount.toLocaleString("vi-VN")} VNĐ
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-700">
                    <span
                      className={`py-1 px-4 rounded-full text-sm ${
                        request.status === "Pending"
                          ? "bg-yellow-200 text-yellow-600"
                          : request.status === "Rejected"
                          ? "bg-red-200 text-red-600"
                          : "bg-green-200 text-green-600"
                      }`}
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

      <div className="flex justify-between items-center mt-4">
        <span className="text-lg font-semibold text-gray-800 bg-green-200 px-3 py-1 rounded-lg shadow-sm">
          {label}:{" "}
          <span
            className={`${
              filterStatus === "Approved"
                ? "text-green-600"
                : filterStatus === "Rejected"
                ? "text-red-600"
                : filterStatus === "Pending"
                ? "text-yellow-600"
                : "text-blue-600"
            }`}
          >
            {amount.toLocaleString("vi-VN")} VNĐ
          </span>
        </span>

        <div className="flex items-center gap-2">
          <button
            className="w-full sm:w-auto px-4 py-2 border rounded-md"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="text-xs sm:text-sm md:text-base font-medium text-center w-full">
            Page {currentPage} of {totalPages}
          </span>

          <button
            className="w-full sm:w-auto px-4 py-2 border rounded-md"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      <div className="flex justify-center my-8">
        <button
          onClick={() => setShowChart(!showChart)}
          className="px-6 py-3 bg-[#14b8a6] text-white font-semibold rounded-lg shadow-md hover:bg-[#0e9488] transition duration-300"
        >
          {showChart ? "Hide Withdrawal Summary" : "View Withdrawal Summary"}
        </button>
      </div>

      {showChart && (
        <div className="my-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Withdrawal Summary
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" fill="#14b8a6" barSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default WithdrawalHistory;
