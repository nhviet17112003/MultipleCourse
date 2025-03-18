import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Spin, Alert, Modal, Select, Tag, Tooltip, message } from "antd";
import { DownloadOutlined, ReloadOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";

const { Option } = Select;

const WalletManageForAdmin = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const [sortOrder, setSortOrder] = useState({
    amount: null,
    date: null,
    status: null,
  });

  const fetchWithdrawalRequests = async () => {
    setLoading(true);
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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWithdrawalRequests();
  }, []);

  useEffect(() => {
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
      message.success("Withdrawal request approved successfully");
      setIsModalVisible(false);
    } catch (err) {
      message.error("Có lỗi xảy ra khi duyệt yêu cầu");
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
      message.success("Withdrawal request rejected");
      setIsModalVisible(false);
    } catch (err) {
      message.error("Có lỗi xảy ra khi từ chối yêu cầu");
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWithdrawalRequests();
  };

  if (loading && !refreshing) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Loading withdrawal requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Alert 
          message="Error" 
          description={error} 
          type="error" 
          showIcon 
          className="max-w-md shadow-md"
        />
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const columns = [
    {
      title: "Withdrawal ID",
      dataIndex: "withdrawal_id",
      key: "withdrawal_id",
      render: (id) => <span className="font-mono text-xs">{id}</span>,
    },
    {
      title: "User Name",
      dataIndex: "user",
      key: "tutorName",
      render: (text) => (
        <div className="flex items-center">
          <span className="font-medium text-gray-800">{text ? text.fullname : ""}</span>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "user",
      key: "email",
      render: (text) => <span className="text-gray-600">{text ? text.email : ""}</span>,
    },
    {
      title: "User Phone",
      dataIndex: "user",
      key: "phone",
      render: (text) => <span className="text-gray-600">{text ? text.phone : ""}</span>,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      sorter: true,
      sortOrder: sortOrder.amount,
      render: (amount) => (
        <span className="text-emerald-600 font-medium">
          {formatCurrency(amount)} VND
        </span>
      ),
      onHeaderCell: () => ({
        onClick: () => handleSort("amount"),
        className: "cursor-pointer hover:bg-gray-100",
      }),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      sorter: true,
      sortOrder: sortOrder.date,
      render: (date) => (
        <Tooltip title={new Date(date).toLocaleString()}>
          <span className="text-gray-600">{new Date(date).toLocaleDateString()}</span>
        </Tooltip>
      ),
      onHeaderCell: () => ({
        onClick: () => handleSort("date"),
        className: "cursor-pointer hover:bg-gray-100",
      }),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      sorter: true,
      sortOrder: sortOrder.status,
      render: (status) => {
        let color = 'default';
        let icon = null;
        
        if (status === 'Pending') {
          color = 'warning';
        } else if (status === 'Approved') {
          color = 'success';
          icon = <CheckCircleOutlined />;
        } else if (status === 'Rejected') {
          color = 'error';
          icon = <CloseCircleOutlined />;
        }
        
        return (
          <Tag color={color} icon={icon}>
            {status}
          </Tag>
        );
      },
      onHeaderCell: () => ({
        onClick: () => handleSort("status"),
        className: "cursor-pointer hover:bg-gray-100",
      }),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() =>
            showModal(
              record.withdrawal_id,
              record.bank_account,
              record.amount,
              record.status
            )
          }
          className="bg-blue-500 hover:bg-blue-600"
        >
          View
        </Button>
      ),
    },
  ];

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredRequests.map(({ withdrawal_id, user, amount, date, status }) => ({
        Withdrawal_ID: withdrawal_id,
        Fullname: user?.fullname || "",
        Email: user?.email || "",
        Phone: user?.phone || "",
        Amount: formatCurrency(amount) + " VND",
        Date: new Date(date).toLocaleString(),
        Status: status,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Withdrawals Report");
    XLSX.writeFile(workbook, "withdrawals_report.xlsx");
    message.success("Report exported successfully");
  };

  const getStatusCount = (status) => {
    return requests.filter(req => req.status === status).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm mb-6 p-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
              Withdrawal Requests Management
            </h1>
            <div className="flex space-x-3">
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={refreshing}
                className="flex items-center"
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={exportToExcel}
                className="bg-blue-500 hover:bg-blue-600 flex items-center"
              >
                Export Report
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
              <p className="text-sm text-blue-600 font-medium">Total Requests</p>
              <p className="text-2xl font-bold text-blue-800">{requests.length}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg shadow-sm">
              <p className="text-sm text-yellow-600 font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-800">{getStatusCount('Pending')}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg shadow-sm">
              <p className="text-sm text-green-600 font-medium">Approved</p>
              <p className="text-2xl font-bold text-green-800">{getStatusCount('Approved')}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg shadow-sm">
              <p className="text-sm text-red-600 font-medium">Rejected</p>
              <p className="text-2xl font-bold text-red-800">{getStatusCount('Rejected')}</p>
            </div>
          </div>

          <div className="mb-6 flex items-center">
            <label className="mr-3 text-gray-700 font-medium">Filter by Status:</label>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-40"
              dropdownClassName="shadow-lg rounded-md"
            >
              <Option value="All">All Requests</Option>
              <Option value="Pending">Pending</Option>
              <Option value="Approved">Approved</Option>
              <Option value="Rejected">Rejected</Option>
            </Select>
            <span className="ml-4 text-sm text-gray-500">
              Showing {filteredRequests.length} of {requests.length} requests
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <Table
            dataSource={filteredRequests}
            columns={columns}
            rowKey="withdrawal_id"
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
            }}
            bordered={false}
            loading={refreshing}
            className="custom-table"
            rowClassName="hover:bg-gray-50 transition-colors"
          />
        </div>
      </div>

      <Modal
        title={<div className="text-lg font-bold text-gray-800">Withdrawal Request Details</div>}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
        centered
        className="custom-modal"
        bodyStyle={{ padding: '24px' }}
      >
        {modalData ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Withdrawal ID</h3>
                <p className="font-mono text-gray-800">{modalData.withdrawal_id}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                <Tag 
                  color={
                    modalData.status === "Pending" ? "warning" : 
                    modalData.status === "Approved" ? "success" : "error"
                  }
                  className="text-sm"
                >
                  {modalData.status}
                </Tag>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Amount</h3>
                <p className="text-lg font-bold text-blue-600">{formatCurrency(modalData.amount)} VND</p>
              </div>
            </div>

            {modalData.bankAccount && modalData.bankAccount.length > 0 ? (
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                <h3 className="text-md font-semibold text-blue-800 mb-4 flex items-center">
                  <span className="mr-2">🏦</span> Bank Account Information
                </h3>
                <div className="space-y-3">
                  <div className="flex">
                    <span className="w-40 text-gray-600 font-medium">Bank Name:</span>
                    <span className="text-gray-800 font-medium">{modalData.bankAccount[0]?.bank_name}</span>
                  </div>
                  <div className="flex">
                    <span className="w-40 text-gray-600 font-medium">Account Number:</span>
                    <span className="font-mono text-gray-800 font-medium">{modalData.bankAccount[0]?.account_number}</span>
                  </div>
                  <div className="flex">
                    <span className="w-40 text-gray-600 font-medium">Account Name:</span>
                    <span className="text-gray-800 font-medium">{modalData.bankAccount[0]?.account_name}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                <p className="text-gray-500">No bank account information available</p>
              </div>
            )}

            <div className="pt-4 flex justify-end space-x-4">
              {modalData.status === "Pending" ? (
                <>
                  <Button
                    size="large"
                    onClick={handleCancel}
                    className="border-gray-300 text-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="large"
                    onClick={handleReject}
                    danger
                    className="flex items-center"
                    icon={<CloseCircleOutlined />}
                  >
                    Reject
                  </Button>
                  <Button
                    size="large"
                    type="primary"
                    onClick={handleApprove}
                    className="bg-green-500 hover:bg-green-600 flex items-center"
                    icon={<CheckCircleOutlined />}
                  >
                    Approve
                  </Button>
                </>
              ) : (
                <div className="w-full">
                  <Alert
                    message={
                      modalData.status === "Approved" 
                        ? "This request has been approved" 
                        : "This request has been rejected"
                    }
                    type={modalData.status === "Approved" ? "success" : "error"}
                    showIcon
                    className="mb-4"
                  />
                  <Button size="large" onClick={handleCancel} className="w-full">
                    Close
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-48">
            <Spin />
          </div>
        )}
      </Modal>

      <style jsx global>{`
        .custom-table .ant-table-thead > tr > th {
          background-color: #f9fafb;
          color: #4b5563;
          font-weight: 600;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .custom-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f3f4f6;
        }
        
        .custom-modal .ant-modal-content {
          border-radius: 12px;
          overflow: hidden;
        }
        
        .custom-modal .ant-modal-header {
          border-bottom: 1px solid #f3f4f6;
          padding: 16px 24px;
        }
        
        .custom-modal .ant-modal-footer {
          border-top: 1px solid #f3f4f6;
        }
      `}</style>
    </div>
  );
};

export default WalletManageForAdmin;