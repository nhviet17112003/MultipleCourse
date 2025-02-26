import React, { useState } from "react";
import axios from "axios";

const WalletStudent = () => {
  const [amount, setAmount] = useState(0);
  const [responseMessage, setResponseMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    setResponseMessage("");

    if (amount < 2000) {
      setResponseMessage("Deposit amount must be greater than 2,000.");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      setResponseMessage("Please login before payment.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/payment/create-payment",
        { amount },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Phản hồi từ server:", response.data);

      if (
        typeof response.data === "string" &&
        response.data.startsWith("http")
      ) {
        window.open(response.data, "_blank");
        setAmount(0);
      }
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu thanh toán:", error);
      setResponseMessage(
        error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100  h-screen">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-500">
          Deposit money into wallet
        </h2>
        <div className="flex flex-col items-center">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-md mb-4"
            placeholder="Enter amount.."
          />
          <div className="flex mb-4">
            <button
              onClick={() => setAmount(50000)}
              className="bg-gray-100 text-gray-600 p-2 rounded-md hover:bg-gray-200 transition duration-300 ease-in-out mr-2"
            >
              50.000
            </button>
            <button
              onClick={() => setAmount(100000)}
              className="bg-gray-100 text-gray-600 p-2 rounded-md hover:bg-gray-200 transition duration-300 ease-in-out mr-2"
            >
              100.000
            </button>
            <button
              onClick={() => setAmount(200000)}
              className="bg-gray-100 text-gray-600 p-2 rounded-md hover:bg-gray-200 transition duration-300 ease-in-out mr-2"
            >
              200.000
            </button>
            <button
              onClick={() => setAmount(300000)}
              className="bg-gray-100 text-gray-600 p-2 rounded-md hover:bg-gray-200 transition duration-300 ease-in-out mr-2"
            >
              300.000
            </button>
            <button
              onClick={() => setAmount(500000)}
              className="bg-gray-100 text-gray-600 p-2 rounded-md hover:bg-gray-200 transition duration-300 ease-in-out mr-2"
            >
              500.000
            </button>
            <button
              onClick={() => setAmount(1000000)}
              className="bg-gray-100 text-gray-600 p-2 rounded-md hover:bg-gray-200 transition duration-300 ease-in-out"
            >
              1.000.000
            </button>
          </div>
          <button
            onClick={handlePayment}
            disabled={loading}
            className=" bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-300 ease-in-out"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span className="ml-2">Loading...</span>
              </div>
            ) : (
              "Deposit"
            )}
          </button>
          {responseMessage && (
            <p className="mt-4 text-center text-sm text-gray-700">
              {responseMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletStudent;
