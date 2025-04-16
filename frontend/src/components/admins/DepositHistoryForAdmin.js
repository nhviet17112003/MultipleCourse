import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSearch, FaFilter, FaSortAmountDown, FaWallet } from "react-icons/fa";

const DepositHistoryForAdmin = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/wallet/all-deposit-history",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch deposit history");
        }

        const data = await response.json();
        setDeposits(data.deposits);
      } catch (error) {
        console.error("Error fetching deposit history:", error);
        toast.error("Failed to load deposit history");
      } finally {
        setLoading(false);
      }
    };

    fetchDeposits();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const filteredDeposits = deposits
    .filter((deposit) => {
      const matchesOrderCode = deposit.order_code
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesUser = deposit.user
        .toLowerCase()
        .includes(userSearchTerm.toLowerCase());
      const matchesDate = dateFilter
        ? new Date(deposit.payment_date).toISOString().split("T")[0] ===
          dateFilter
        : true;
      return matchesOrderCode && matchesUser && matchesDate;
    })
    .sort((a, b) => {
      const dateA = new Date(a.payment_date);
      const dateB = new Date(b.payment_date);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  const totalAmount = filteredDeposits.reduce(
    (sum, deposit) => sum + deposit.payment_amount,
    0
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDeposits.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredDeposits.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
          <div className="px-8 py-10 border-b border-gray-100">
            <h2 className="text-3xl font-bold text-black flex items-center gap-2">
              <FaWallet className="text-black" />
              Wallet History
            </h2>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full">
                    <span className="font-semibold">
                      {filteredDeposits.length}
                    </span>{" "}
                    Total Deposits
                  </div>
                  <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-full">
                    <span className="font-semibold">
                      {formatCurrency(totalAmount)}
                    </span>{" "}
                    Total Amount
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Search by order code..."
                    className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 w-full md:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <FaSearch className="absolute left-3 top-3.5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                </div>
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Search by user..."
                    className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 w-full md:w-64"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                  />
                  <FaSearch className="absolute left-3 top-3.5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                </div>
                <div className="relative group">
                  <input
                    type="date"
                    className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 w-full md:w-48"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                  <FaFilter className="absolute left-3 top-3.5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Order Code
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {currentItems.map((deposit) => (
                  <tr
                    key={deposit.order_code}
                    className="hover:bg-indigo-50/50 transition-colors duration-200"
                  >
                    <td className="px-8 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {deposit.order_code}
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500">
                      {deposit.user}
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="font-semibold text-indigo-600">
                        {formatCurrency(deposit.payment_amount)}
                      </span>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(deposit.payment_date)}
                    </td>
                    <td className="px-8 py-4 text-sm text-gray-500">
                      {deposit.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-8 py-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium text-indigo-600">
                      {indexOfFirstItem + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium text-indigo-600">
                      {Math.min(indexOfLastItem, filteredDeposits.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-indigo-600">
                      {filteredDeposits.length}
                    </span>{" "}
                    results
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-xl shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (number) => (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-200 ${
                            currentPage === number
                              ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {number}
                        </button>
                      )
                    )}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositHistoryForAdmin;
