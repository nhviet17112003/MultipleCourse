import { Dropdown, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import { EllipsisOutlined } from "@ant-design/icons";
import { toast, ToastContainer } from "react-toastify";
import { CheckOutlined, StopOutlined } from "@ant-design/icons";
const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // const toggleUserStatus = async (id) => {
 
  //   try {
  //     const response = await fetch(
  //       `http://localhost:3000/api/users/set-status-user/${id}`,
  //       {
  //         method: "PUT",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  //         },
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error("Failed to update user status");
  //     }

  //     const updatedUsers = users.map((user) =>
  //       user._id === id ? { ...user, status: !user.status } : user
  //     );
  //     setUsers(updatedUsers);
  //   } catch (err) {
  //     setError(err.message);
  //   }
  // };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  const columns = [
    {
      title: "Avatar",
      dataIndex: "avatar",
      key: "avatar",
      render: (avatar, record) => (
        <img
        src={avatar || "https://via.placeholder.com/150"} 
          alt="avatar"
          className="w-10 h-10 rounded-full mx-auto"
        />
      ),
    },
    {
      title: "Full Name",
      dataIndex: "fullname",
      key: "fullname",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
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
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        
         
            status
              ? <Tag color='green'>Active</Tag>: <Tag color='red'>Inactive</Tag>
          
        
      
      
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (record) => (
        // <button
        //   onClick={() => {
        //     if (record.role !== "Admin") toggleUserStatus(record.key);  
        //   }}
        //   className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-700"
        // >
        //   {record.status ? "Ban" : "Unban"}
        // </button>
        <DropDownMenu  record={record} setUsers={setUsers} users={users}/>  
      ),
    },
  ];
  const data = users.map((user) => ({
    key: user._id,
    avatar: user.avatar,
    fullname: user.fullname,
    email: user.email,
    phone: user.phone || "N/A",
    role: user.role,
    status: user.status,
  }));

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold text-center mb-6">Manage Users</h2>
      <Table columns={columns} dataSource={data} />
      <ToastContainer />
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

  // Xử lý khi người dùng nhấn vào Ban/Unban
  const handleStatusToggleClick = () => {
    if (record.status) {
      // Nếu user đang active, hiển thị modal khi muốn ban
      setIsModalOpen(true);
    } else {
      // Nếu user đang inactive, unban trực tiếp không cần lý do
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
    <div>
      <Dropdown menu={{items}}>
        <EllipsisOutlined />
      </Dropdown>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70 backdrop-blur-md z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-96 border border-gray-100 dark:border-gray-700 transform transition-all">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Rejection Reason
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
              <textarea
                className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white transition duration-300 resize-none"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Please provide a detailed reason for rejection..."
                rows="4"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                className="px-5 py-2.5 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-300 font-medium"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition duration-300 shadow-lg hover:shadow-xl font-medium flex items-center"
                onClick={() => {
                  toggleUserStatus(
                    record.key,
                    "Rejected",
                    rejectReason
                  );
                }}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};