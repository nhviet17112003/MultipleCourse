import React, { useEffect, useState, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaWallet, FaQuestionCircle } from "react-icons/fa";

const WalletManage = () => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [messageBalance, setMessageBalance] = useState("");
  const [message, setMessage] = useState();
  const [isWithdrawFormVisible, setIsWithdrawFormVisible] = useState(false);
  const [bankData, setBankData] = useState([]);
  const [isUpdateFormVisible, setIsUpdateFormVisible] = useState(false);
  const [newBankName, setNewBankName] = useState("");
  const [newAccountNumber, setNewAccountNumber] = useState("");
  const [newAccountHolder, setNewAccountHolder] = useState("");
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [filteredBanks, setFilteredBanks] = useState([]);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);

  const bankList = [
    "SHB",
    "Sacombank",
    "Vietcombank",
    "Viettinbank",
    "Techcombank",
    "ACB",
    "BIDV",
    "MB Bank",
    "VPBank",
    "Eximbank",
    "LienVietPostBank",
    "OceanBank",
    "HDBank",
    "Bac A Bank",
    "SeABank",
    "NamABank",
    "KienLongBank",
    "SCB",
    "VIB",
    "PGBank",
    "TPBank",
    "Asia Commercial Bank (ACB)",
    "DongA Bank",
    "Shinhan Bank",
    "Standard Chartered Bank",
    "HSBC Vietnam",
    "Citibank",
    "JPMorgan Chase Bank",
    "ANZ Vietnam",
    "UOB Vietnam",
    "VietABank",
    "BaoViet Bank",
    "Saigonbank",
    "VietCapital Bank",
    "Public Bank Vietnam",
    "First Commercial Bank Vietnam",
    "Woori Bank",
    "Hong Leong Bank Vietnam",
    "Indovina Bank",
    "Shanghai Pudong Development Bank",
    "OCB (Orient Commercial Bank)",
    "Hong Kong and Shanghai Banking Corporation (HSBC)",
    "China Construction Bank Vietnam",
    "VIB Bank",
    "CitiBank Vietnam",
    "Agribank",
    "Techcom Securities",
    "Vietnam International Bank (VIB)",
    "Keppel Bank",
  ];

  const handleUpdateClick = (bank) => {
    setNewBankName(bank.bank_name);
    setNewAccountNumber(bank.account_number);
    setNewAccountHolder(bank.account_name);
    setIsUpdateFormVisible(true);
  };

  const handleAccountHolderChange = (e) => {
    const value = e.target.value;
    if (/\d/.test(value)) {
      toast.error("Invalid account name.");
      return;
    }
    setNewAccountHolder(value);
  };

  const fetchWithdrawHistory = useCallback(async () => {
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

      const data = await response.json();

      if (response.ok && data.withdrawals) {
        const pendingRequest = data.withdrawals.some(
          (withdrawal) => withdrawal.status === "Pending"
        );
        setHasPendingRequest(pendingRequest);
      } else {
        toast.error(data.message || "Error fetching withdrawal history.");
      }
    } catch (error) {
      console.error("Error fetching withdrawal history:", error);
      toast.error("An error occurred while fetching withdrawal history.");
    }
  }, []);

  useEffect(() => {
    fetchWithdrawHistory();
  }, [fetchWithdrawHistory]);

  const handleCancelUpdate = () => {
    setNewBankName("");
    setNewAccountNumber("");
    setNewAccountHolder("");
    setIsUpdateFormVisible(false);
  };

  const isWithdrawalButtonEnabled =
    withdrawAmount > 0 && withdrawAmount <= balance && bankData.length > 0;

  const handleBankNameChange = (e) => {
    const value = e.target.value;
    setNewBankName(value);
    const filtered = bankList.filter((bank) =>
      bank.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredBanks(filtered);
  };

  const handleBankSelection = (bank) => {
    setNewBankName(bank);
    setFilteredBanks([]);
  };

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/wallet/show-balance",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok && data.current_balance !== undefined) {
          setBalance(data.current_balance);
        } else {
          toast.error(data.message || "No balance found");

          setBalance(0);
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
        setBalance(0);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/users/profile",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok && data.bankAccount) {
          setBankData(data.bankAccount);
        } else {
          toast.error("No bank account found in profile data.");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Error fetching user profile");
      }
    };

    fetchUserProfile();
  }, []);

  const handleWithdraw = async () => {
    if (withdrawAmount <= 0) {
      toast.error("Invalid withdrawal amount.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:3000/api/wallet/withdrawal-request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            amount: withdrawAmount,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Withdrawal request has been submitted successfully.");
        setHasPendingRequest(true);
        setWithdrawAmount(0);
        setIsWithdrawFormVisible(false);
        setIsConfirmVisible(false);
        fetchWithdrawHistory();
      } else {
        if (data.message === "You already have a pending withdrawal request.") {
          toast.error(
            "You have a pending withdrawal request. Please wait and try again later!"
          );
          setHasPendingRequest(true);
        } else {
          toast.error(
            data.message || "Please fill in your bank information completely."
          );
        }
      }
    } catch (error) {
      console.error("Error submitting withdrawal request:", error);
      toast.error("An error occurred while sending the request.");
    }
  };

  const handleUpdateBank = async () => {
    if (!newBankName || !newAccountNumber || !newAccountHolder) {
      toast.error("Please fill in your bank information completely.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:3000/api/users/update-bank-account",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            bank_name: newBankName,
            account_number: newAccountNumber,
            account_name: newAccountHolder,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Bank information updated successfully.");
        setBankData([
          {
            bank_name: newBankName,
            account_number: newAccountNumber,
            account_name: newAccountHolder,
          },
        ]);
        setIsUpdateFormVisible(false);
      } else {
        toast.error(data.message || "An error occurred while updating.");
      }
    } catch (error) {
      console.error("Error updating bank account:", error);
      toast.error("An error occurred while updating bank information.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center bg-gray-50 min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
        <p className="mt-4 text-gray-600 ml-4 text-xl font-semibold">
          Đang tải số dư ví...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-start items-start bg-gradient-to-b from-[#14b8a6] to-indigo-200">
      <div className="max-w-4xl w-full mx-auto bg-white rounded-xl shadow-xl p-6">
        <h1 className="text-3xl font-bold text-black-700 text-center mb-8">
          Wallet Manage
        </h1>
        <div className="flex justify-between items-center mb-8">
          <p className="text-lg font-semibold text-gray-800">Current Balance</p>
          <p className="text-3xl font-bold text-green-600">
            {balance?.toLocaleString("vi-VN")} ₫
          </p>
        </div>
        {hasPendingRequest ? (
          <p className="text-red-500 font-semibold">
            You have a pending withdrawal request. Please wait and try again
            later.
          </p>
        ) : (
          !isWithdrawFormVisible && (
            <button
              onClick={() => setIsWithdrawFormVisible(true)}
              className="w-full py-3 bg-[#14b8a6] text-white rounded-lg shadow-lg hover:bg-green-700 transition-all ease-in-out"
            >
              Withdrawal Request
            </button>
          )
        )}

        {isWithdrawFormVisible && (
          <div className="mt-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="relative w-full">
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => {
                    const inputAmount = Number(e.target.value);
                    if (inputAmount > balance) {
                      setMessageBalance(
                        "The withdrawal amount cannot exceed the current balance."
                      );
                    } else {
                      setMessageBalance("");
                      toast.clearWaitingQueue();
                    }
                    setWithdrawAmount(inputAmount);
                  }}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Số tiền muốn rút"
                />
                <div className="absolute inset-y-0 right-2 flex items-center group">
                  <FaQuestionCircle className="text-gray-400 hover:text-gray-600 cursor-pointer text-2xl" />
                  <div className="absolute bottom-12 right-0 w-52 p-3 text-sm text-white bg-gray-700 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="font-semibold">To withdraw money you must:</p>
                    <ul className="list-disc list-inside mt-1">
                      <li>Add the bank</li>
                      <li>Amount must be greater than 0</li>
                      <li>Amount must be less than the current balance</li>
                    </ul>
                  </div>
                </div>
              </div>

              {messageBalance && (
                <p className="mt-6 text-center text-red-600 font-semibold">
                  {messageBalance}
                </p>
              )}
              <button
                onClick={() => setIsConfirmVisible(true)}
                disabled={!isWithdrawalButtonEnabled}
                className={`w-full mt-4 py-3 ${
                  isWithdrawalButtonEnabled
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-400 cursor-not-allowed"
                } text-white rounded-lg transition-all`}
              >
                Withdrawal Confirmation
              </button>
            </div>

            <div className="mb-8 mt-8">
              <h2 className="text-3xl font-semibold text-indigo-700 mb-4">
                Bank Information
              </h2>

              {bankData.length > 0 ? (
                bankData.map((bank, index) => (
                  <div
                    key={index}
                    className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 my-4 flex items-center justify-between"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center mb-3">
                        <p className="text-lg font-medium text-gray-700">
                          <strong>{bank.bank_name}</strong>
                        </p>
                      </div>
                      <p className="text-gray-600 mb-2">
                        <strong>Account Number:</strong> {bank.account_number}
                      </p>
                      <p className="text-gray-600 mb-4">
                        <strong>Account Holder Name:</strong>{" "}
                        {bank.account_name}
                      </p>
                    </div>

                    <button
                      onClick={() => handleUpdateClick(bank)}
                      className="py-2 px-6 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-all ease-in-out flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13 3l-7 7V3h14v14H7V10m3-4l4 4"
                        />
                      </svg>
                      <span>Update</span>
                    </button>
                  </div>
                ))
              ) : (
                <div>
                  <p className="text-gray-600">
                    No bank information available.
                  </p>
                  <button
                    onClick={() => setIsUpdateFormVisible(true)}
                    className="mt-4 py-2 px-6 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all"
                  >
                    Add Bank
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        {isConfirmVisible && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl shadow-xl text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Withdrawal Confirmation
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to withdraw{" "}
                {withdrawAmount.toLocaleString("vi-VN")} ₫ ?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleWithdraw}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setIsConfirmVisible(false)}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {isUpdateFormVisible && (
          <div className="mt-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="relative w-full">
                <input
                  type="text"
                  value={newBankName}
                  onChange={handleBankNameChange}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Bank Name"
                />
                {newBankName && (
                  <ul className="absolute mt-2 w-full bg-white  rounded-lg shadow-md max-h-60 overflow-y-auto z-10">
                    {filteredBanks.map((bank, index) => (
                      <li
                        key={index}
                        onClick={() => handleBankSelection(bank)}
                        className="p-2 cursor-pointer hover:bg-gray-200"
                      >
                        {bank}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <input
                type="text"
                value={newAccountNumber}
                onChange={(e) => setNewAccountNumber(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Account Number"
              />
              <input
                type="text"
                value={newAccountHolder}
                onChange={handleAccountHolderChange}
                placeholder="Account Holder Name"
                className="w-full p-2 border rounded"
              />

              <div className="flex gap-4">
                <button
                  onClick={handleUpdateBank}
                  className="w-full py-3 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-all ease-in-out"
                >
                  Bank Update
                </button>
                <button
                  onClick={handleCancelUpdate}
                  className="w-full py-3 bg-gray-600 text-white rounded-lg shadow-lg hover:bg-gray-700 transition-all ease-in-out"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {message && (
          <p className="mt-6 text-center text-red-600 font-semibold">
            {message}
          </p>
        )}
        <ToastContainer />
      </div>
    </div>
  );
};

export default WalletManage;
