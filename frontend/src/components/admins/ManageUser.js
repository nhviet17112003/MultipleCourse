import { Dropdown, Table, Tag, Typography, Card, Spin, Alert, Space, Divider, Avatar, Button } from "antd";
import { useEffect, useState } from "react";
import { 
  EllipsisOutlined, 
  CheckOutlined, 
  StopOutlined, 
  UserOutlined,
  TeamOutlined,
  FilterOutlined,
  SearchOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const { Title, Text } = Typography;

const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filterRole, setFilterRole] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/users/all-users",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <Spin size="large" tip="Loading user data..." />
    </div>
  );
  
  if (error) return (
    <div className="p-8">
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
      />
    </div>
  );

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleRoleFilter = (role) => {
    setFilterRole(role === filterRole ? null : role);
  };

  const resetFilters = () => {
    setSearchText("");
    setFilterRole(null);
  };

  const filteredData = users
    .filter(user => {
      if (!searchText) return true;
      return (
        user.fullname?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchText.toLowerCase())
      );
    })
    .filter(user => {
      if (!filterRole) return true;
      return user.role === filterRole;
    })
    .map((user) => ({
      key: user._id,
      avatar: user.avatar,
      fullname: user.fullname,
      email: user.email,
      phone: user.phone || "N/A",
      role: user.role,
      status: user.status,
    }));

  const columns = [
    {
      title: "Avatar",
      dataIndex: "avatar",
      key: "avatar",
      width: 80,
      render: (avatar) => (
        <div className="flex justify-center">
          <Avatar 
            size={40} 
            src={avatar || undefined}
            icon={!avatar && <UserOutlined />}
            className="border-2 border-blue-100"
          />
        </div>
      ),
    },
    {
      title: "Full Name",
      dataIndex: "fullname",
      key: "fullname",
      sorter: (a, b) => a.fullname.localeCompare(b.fullname),
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email) => (
        <Text copyable className="text-blue-600 hover:text-blue-800">{email}</Text>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      filters: [
        { text: 'Admin', value: 'Admin' },
        { text: 'User', value: 'User' },
        { text: 'Instructor', value: 'Instructor' },
      ],
      onFilter: (value, record) => record.role === value,
      render: (role) => {
        let color = role === 'Admin' ? 'purple' : role === 'Instructor' ? 'blue' : 'default';
        return (
          <Tag color={color} className="px-3 py-1">
            {role.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        status 
          ? <Tag color="success" icon={<CheckOutlined />} className="px-3 py-1">Active</Tag>
          : <Tag color="error" icon={<StopOutlined />} className="px-3 py-1">Inactive</Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 80,
      render: (record) => (
        <DropDownMenu record={record} setUsers={setUsers} users={users} />  
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <Card className="shadow-xl rounded-lg overflow-hidden" bordered={false}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <TeamOutlined className="text-blue-500 text-3xl mr-4" />
            <Title level={2} className="m-0 text-blue-800">
              Manage Users
            </Title>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <SearchOutlined className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            
            <Dropdown
              menu={{
                items: [
                  {
                    key: '1',
                    label: 'Admin',
                    onClick: () => handleRoleFilter('Admin'),
                  },
                  {
                    key: '2',
                    label: 'Instructor',
                    onClick: () => handleRoleFilter('Instructor'),
                  },
                  {
                    key: '3',
                    label: 'User',
                    onClick: () => handleRoleFilter('User'),
                  },
                ],
              }}
              placement="bottomRight"
            >
              <Button icon={<FilterOutlined />} className={filterRole ? "bg-blue-50" : ""}>
                {filterRole || "Filter Role"}
              </Button>
            </Dropdown>
            
            {(searchText || filterRole) && (
              <Button
                icon={<ReloadOutlined />}
                onClick={resetFilters}
                className="text-gray-600"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
        
        {/* <Divider className="mb-6" /> */}
        
        <Table 
          columns={columns} 
          dataSource={filteredData}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} users`,
          }}
          className="shadow-sm"
          rowClassName="hover:bg-blue-50 transition-colors"
          // bordered
          scroll={{ x: 'max-content' }}
        />
      </Card>
      <ToastContainer />
      {/* position="bottom-right" theme="colored"  */}
    </div>
  );
};

export default ManageUser;

const DropDownMenu = ({record, setUsers, users}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
    
  const toggleUserStatus = async (id, status, message = "") => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/users/set-status-user/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({ status, message }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user status");
      }

      const updatedUsers = users.map((user) =>
        user._id === id ? { ...user, status: !user.status } : user
      );
      setUsers(updatedUsers);
      setIsModalOpen(false);
      setRejectReason("");
      toast.success("User status updated successfully");
    } catch (err) {
      toast.error("Error changing user status.");
    }
  };

  const handleStatusToggleClick = () => {
    if (record.status) {
      setIsModalOpen(true);
    } else {
      toggleUserStatus(record.key);
    }
  };

  const items = [
    {
      key: '1',
      label: (
        <div 
          onClick={handleStatusToggleClick}
          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors duration-150"
        >
          {record.status ? (
            <>
              <StopOutlined className="h-4 w-4 text-red-500"/>
              <span>Ban</span>
            </>
          ) : (
            <>
              <CheckOutlined className="h-4 w-4 text-green-500" />
              <span>Unban</span>
            </>
          )}
        </div>
      ),
    },
  ];

  return(
    <div className="flex justify-center">
      <Dropdown menu={{items}} trigger={['click']} placement="bottomRight">
        <Button 
          type="text" 
          icon={<EllipsisOutlined />} 
          className="flex items-center justify-center hover:bg-gray-100 rounded-full w-8 h-8" 
        />
      </Dropdown>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70 backdrop-blur-sm z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-96 border border-gray-100 dark:border-gray-700 transform transition-all">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Ban User
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Please provide a reason for banning this user:
              </label>
              <textarea
                className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white transition duration-300 resize-none"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter detailed reason..."
                rows="4"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button 
                className="px-5 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                danger
                className="px-5 py-2 transition shadow-md"
                onClick={() => {
                  toggleUserStatus(
                    record.key,
                    "Rejected",
                    rejectReason
                  );
                }}
                disabled={!rejectReason.trim()}
              >
                Ban User
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};