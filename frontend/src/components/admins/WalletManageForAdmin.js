import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Spin, Alert, Modal, Select } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

const { Option } = Select;

const WalletManageForAdmin = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState({
    amount: null,
    date: null,
    status: null,
  });

  const fetchWithdrawalRequests = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.get(
        "http://localhost:3000/api/wallet/all-withdrawal-requests",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      setRequests(response.data.pendingRequests);
      setFilteredRequests(response.data.pendingRequests);
    } catch (err) {
      setError("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawalRequests();
  }, []);

  useEffect(() => {
    // Filter requests based on selected status filter
    if (statusFilter === "All") {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(
        requests.filter((request) => request.status === statusFilter)
      );
    }
  }, [statusFilter, requests]);

  const showModal = (withdrawal_id, bankAccount, amount, status) => {
    setModalData({ withdrawal_id, bankAccount, amount, status });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleApprove = async () => {
    try {
      const response = await axios.put(
        "http://localhost:3000/api/wallet/approve-withdrawal-request",
        { withdrawalId: modalData.withdrawal_id },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.withdrawal_id === modalData.withdrawal_id
            ? { ...request, status: "Approved" }
            : request
        )
      );
      setIsModalVisible(false);
    } catch (err) {
      setError("Có lỗi xảy ra khi duyệt yêu cầu");
    }
  };

  const handleReject = async () => {
    try {
      const response = await axios.put(
        "http://localhost:3000/api/wallet/reject-withdrawal-request",
        { withdrawalId: modalData.withdrawal_id },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.withdrawal_id === modalData.withdrawal_id
            ? { ...request, status: "Rejected" }
            : request
        )
      );
      setIsModalVisible(false);
    } catch (err) {
      setError("Có lỗi xảy ra khi từ chối yêu cầu");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Alert message={error} type="error" showIcon />
      </div>
    );
  }

  const handleSort = (key) => {
    const newSortOrder = sortOrder[key] === "ascend" ? "descend" : "ascend";
    setSortOrder((prevState) => ({
      ...prevState,
      [key]: newSortOrder,
    }));

    const sortedRequests = [...filteredRequests].sort((a, b) => {
      if (key === "amount") {
        return newSortOrder === "ascend"
          ? a.amount - b.amount
          : b.amount - a.amount;
      }
      if (key === "date") {
        return newSortOrder === "ascend"
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      }
      if (key === "status") {
        const statusOrder = ["Pending", "Approved", "Rejected"];
        return newSortOrder === "ascend"
          ? statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
          : statusOrder.indexOf(b.status) - statusOrder.indexOf(a.status);
      }
      return 0;
    });

    setFilteredRequests(sortedRequests);
  };

  const columns = [
    {
      title: "Withdrawal ID",
      dataIndex: "withdrawal_id",
      key: "withdrawal_id",
      render: (id) => <span>{id}</span>,
    },
    {
      title: "User Name",
      dataIndex: "user",
      key: "tutorName",
      render: (text) => (
        <span className="font-semibold">{text ? text.fullname : ""}</span>
      ),
    },
    {
      title: "Email",
      dataIndex: "user",
      key: "email",
      render: (text) => <span>{text ? text.email : ""}</span>,
    },
    {
      title: "User Phone",
      dataIndex: "user",
      key: "phone",
      render: (text) => <span>{text ? text.phone : ""}</span>,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      sorter: true,
      sortOrder: sortOrder.amount,
      render: (amount) => (
        <span className="text-green-600 font-semibold">{amount} VND</span>
      ),
      onHeaderCell: () => ({
        onClick: () => handleSort("amount"),
      }),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      sorter: true,
      sortOrder: sortOrder.date,
      render: (date) => <span>{new Date(date).toLocaleString()}</span>,
      onHeaderCell: () => ({
        onClick: () => handleSort("date"),
      }),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      sorter: true,
      sortOrder: sortOrder.status,
      render: (status) => (
        <span
          className={`px-2 py-1 rounded-lg ${
            status === "Pending"
              ? "bg-yellow-200 text-yellow-700"
              : status === "Approved"
              ? "bg-green-200 text-green-700"
              : status === "Rejected"
              ? "bg-red-200 text-red-700"
              : ""
          }`}
        >
          {status}
        </span>
      ),
      onHeaderCell: () => ({
        onClick: () => handleSort("status"),
      }),
    },
    {
      title: "Detail",
      key: "detail",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() =>
            showModal(
              record.withdrawal_id,
              record.bank_account,
              record.amount,
              record.status
            )
          }
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        List of withdrawal requests
      </h1>
      <div className="mb-4">
        <Select
          defaultValue="All"
          style={{ width: 200 }}
          onChange={setStatusFilter}
        >
          <Option value="All">All</Option>
          <Option value="Approved">Approve</Option>
          <Option value="Rejected">Reject</Option>
          <Option value="Pending">Pending</Option>
        </Select>
      </div>
      <Button
        type="primary"
        icon={<DownloadOutlined />}
        className="mb-4"
        onClick={() => console.log("Export functionality coming soon")}
      >
        Export report
      </Button>
      <Table
        dataSource={filteredRequests}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        bordered
        className="shadow-md"
      />

      <Modal
        title="Withdrawal Details"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
        className="rounded-lg shadow-lg bg-white"
      >
        {modalData ? (
          <div className="space-y-6">
            <div className="text-lg font-semibold text-gray-800 space-y-2">
              <p>
                <strong>Withdrawal ID:</strong> {modalData.withdrawal_id}
              </p>
              <p>
                <strong>Amount:</strong>{" "}
                <span className="text-blue-600">{modalData.amount} VND</span>
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`font-semibold ${
                    modalData.status === "Pending"
                      ? "text-yellow-500"
                      : modalData.status === "Rejected"
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {modalData.status}
                </span>
              </p>
            </div>

            {modalData.bankAccount && modalData.bankAccount.length > 0 ? (
              <div className="bg-gray-100 p-4 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Bank Account Information
                </h3>
                <div className="space-y-2">
                  <p>
                    <strong>Bank Name:</strong>{" "}
                    {modalData.bankAccount[0]?.bank_name}
                  </p>
                  <p>
                    <strong>Account Number:</strong>{" "}
                    {modalData.bankAccount[0]?.account_number}
                  </p>
                  <p>
                    <strong>Account Name:</strong>{" "}
                    {modalData.bankAccount[0]?.account_name}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">
                No bank account information available
              </p>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              {modalData.status === "Pending" ? (
                <>
                  <Button
                    type="primary"
                    onClick={handleApprove}
                    className="w-32 bg-green-500 hover:bg-green-600"
                  >
                    Approve
                  </Button>
                  <Button
                    type="default"
                    onClick={handleReject}
                    className="w-32 bg-red-500 text-white hover:bg-red-600"
                  >
                    Reject
                  </Button>
                </>
              ) : (
                <p className="text-green-500 font-semibold">
                  Request has been processed
                </p>
              )}
            </div>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </Modal>
    </div>
  );
};

export default WalletManageForAdmin;
