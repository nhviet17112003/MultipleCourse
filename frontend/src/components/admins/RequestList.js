import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { toast, ToastContainer } from "react-toastify";
import { 
  Dropdown, 
  Spin, 
  Table, 
  Tag, 
  Input, 
  Button, 
  Modal, 
  Typography, 
  Select 
} from "antd";
import { 
  EllipsisOutlined, 
  CheckOutlined, 
  StopOutlined, 
  SearchOutlined,
  FilterOutlined 
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Search } = Input;

export default function RequestList() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const token = localStorage.getItem("authToken");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const { theme } = useTheme();

  const [spinning, setSpinning] = useState(false);
  const [percent, setPercent] = useState(0);

  // Search and Filter States
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    if (token) {
      fetchRequests();
    } else {
      setError("User not authenticated.");
    }
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "http://localhost:3000/api/requests/all-requests",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const data = await response.json();
      const sortedRequests = Array.isArray(data)
        ? data.sort(
            (a, b) => new Date(b.request_date) - new Date(a.request_date)
          )
        : [];

      setRequests(sortedRequests);
      setFilteredRequests(sortedRequests);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError("Failed to fetch requests.");
    } finally {
      setLoading(false);
    }
  };

  // Search and Filter Logic
  const handleSearch = (value) => {
    setSearchText(value);
    filterRequests(value, statusFilter);
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    filterRequests(searchText, value);
  };

  const filterRequests = (search, status) => {
    let filtered = requests;
  
    if (search) {
      filtered = filtered.filter(request => {
        // Kiểm tra request có tồn tại không
        if (!request) return false;
  
        // Kiểm tra và chuyển đổi an toàn
        const courseTitle = typeof request.course_title === 'string' 
          ? request.course_title.toLowerCase() 
          : '';
        const requestType = typeof request.request_type === 'string' 
          ? request.request_type.toLowerCase() 
          : '';
  
        return courseTitle.includes(search.toLowerCase()) ||
               requestType.includes(search.toLowerCase());
      });
    }
  
    if (status !== "All") {
      filtered = filtered.filter(request => 
        request && request.status === status
      );
    }
  
    setFilteredRequests(filtered);
  };

  const handleProcessRequest = async (
    requestId,
    status,
    requestType,
    message = ""
  ) => {
    let endpoint = "";
    let method = "POST";

    switch (true) {
      case requestType.includes("Created new course"):
        endpoint = "process-create-course";
        break;
      case requestType.includes("Updated course"):
        endpoint = "process-update-course";
        method = "PUT";
        break;
      case requestType.includes("Deleted course"):
        endpoint = "process-delete-course";
        method = "DELETE";
        break;
      default:
        toast.error("Invalid request type");
        return;
    }

    try {
      setSpinning(true);
      setPercent(0);
      
      let ptg = 0;
      const interval = setInterval(() => {
        ptg += 5;
        setPercent(ptg);
        if (ptg >= 100) {
          clearInterval(interval);
        }
      }, 100);

      const response = await fetch(
        `http://localhost:3000/api/courses/${endpoint}/${requestId}`,
        {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status, message }),
        }
      );

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      toast.success("Successfully processed request.");
      setIsModalOpen(false);
      setRejectReason("");
      await fetchRequests();
    } catch (err) {
      console.error("Error processing request:", err);
      toast.error("Failed to process request");
    } finally {
      setSpinning(false);
      setPercent(100);
    }
  };

  const columns = [ 
    {
      title: "Course Name",
      dataIndex: "course_title",
      key: "course_title",
      sorter: (a, b) => a.course_title.localeCompare(b.course_title),
    },
    {
      title: "Request Type",
      dataIndex: "request_type",
      key: "request_type",
      sorter: (a, b) => a.request_type.localeCompare(b.request_type),
    },
    {
      title: "Content",
      dataIndex: "content",
      key: "content",
      render: (content) => (
        <div className="space-y-1">
          {content.map((item, index) => (
            <div key={index} className="text-sm">
              <Text strong>{item.title}:</Text> {item.value}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: 'Pending', value: 'Pending' },
        { text: 'Approved', value: 'Approved' },
        { text: 'Rejected', value: 'Rejected' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const statusColors = {
          Pending: { 
            color: "yellow", 
            className: "bg-yellow-100 text-yellow-800 px-3 py-1" 
          },
          Approved: { 
            color: "green", 
            className: "bg-green-100 text-green-800 px-3 py-1" 
          },
          Rejected: { 
            color: "red", 
            className: "bg-red-100 text-red-800 px-3 py-1" 
          }
        };
    
        const statusStyle = statusColors[status] || statusColors.Pending;
    
        return (
          <Tag 
            color={statusStyle.color} 
            className={statusStyle.className}
          >
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (record) => (
        record.status === "Pending" && (
          <DropDownMenu 
            handleProcessRequest={handleProcessRequest} 
            setIsModalOpen={setIsModalOpen} 
            setSelectedRequest={setSelectedRequest}  
            record={record} 
          />
        )
      ),
    },
  ];

  const data = filteredRequests.map((request) => ({
    key: request._id,
    course_title: request.course_title || "N/A",
    request_type: request.request_type || "N/A",
    content: request.content || [],
    status: request.status,
  }));

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-blue-50 to-indigo-100'} p-6`}>
      <Spin spinning={spinning} percent={percent} fullscreen />
      
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Title level={2} className={`m-0 ${theme === 'dark' ? 'text-white' : 'text-blue-800'}`}>
            Request Management
          </Title>
          
          <div className="flex items-center space-x-4">
          <Input
  placeholder="Search requests"
  prefix={<SearchOutlined className="text-gray-400 mr-2" />}
  value={searchText}
  onChange={(e) => handleSearch(e.target.value)}
  className="w-64"
  allowClear
/>

            <Select
              style={{ width: 200 }}
              placeholder="Filter by Status"
              onChange={handleStatusFilter}
              size="large"
              suffixIcon={<FilterOutlined />}
            >
              <Select.Option value="All">All Statuses</Select.Option>
              <Select.Option value="Pending">Pending</Select.Option>
              <Select.Option value="Approved">Approved</Select.Option>
              <Select.Option value="Rejected">Rejected</Select.Option>
            </Select>
          </div>
        </div>

        {loading && (
          <div className="text-center text-blue-500 mb-4">Loading...</div>
        )}
        {error && (
          <div className="text-center text-red-500 mb-4">{error}</div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <Table 
            columns={columns} 
            dataSource={data}
            pagination={{ 
              position: ['bottomCenter'],
              showSizeChanger: true,
              pageSizeOptions: [10, 20, 50],
            }}
            className="custom-table"
          />
        </div>
      </div>

      <Modal
        title="Provide Rejection Reason"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>,
          <Button 
            key="reject" 
            type="primary" 
            danger
            onClick={() => {
              handleProcessRequest(
                selectedRequest.key,
                "Rejected",
                selectedRequest.request_type,
                rejectReason
              );
            }}
          >
            Reject Request
          </Button>
        ]}
      >
        <Input.TextArea
          rows={4}
          placeholder="Please provide a detailed reason for rejection..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>

      <ToastContainer theme={theme === "dark" ? "dark" : "light"} />
    </div>
  );
}

const DropDownMenu = ({record, handleProcessRequest, setIsModalOpen, setSelectedRequest}) => {
  const items = [
    {
      key: '1',
      label: (
        <div
          onClick={() => handleProcessRequest(record.key, "Approved", record.request_type)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 rounded-md transition-colors duration-150 cursor-pointer"
        >
          <CheckOutlined className="h-4 w-4" />
          <span>Approve</span>
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <div
          onClick={() => {
            setIsModalOpen(true);
            setSelectedRequest(record);
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors duration-150 cursor-pointer"
        >
          <StopOutlined className="h-4 w-4" />
          <span>Reject</span>
        </div>
      ),
    },
  ];

  return (
    <Dropdown menu={{items}} trigger={['click']}>
      <Button 
        type="text" 
        icon={<EllipsisOutlined />} 
        className="hover:bg-gray-100 rounded-full"
      />
    </Dropdown>
  );
}