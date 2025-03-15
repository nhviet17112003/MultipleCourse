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

const DropDownMenu = ({record, setUsers, users}) =>{
  const toggleUserStatus = async (id) => {
 
    try {
      const response = await fetch(
        `http://localhost:3000/api/users/set-status-user/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user status");
      }

      const updatedUsers = users.map((user) =>
        user._id === id ? { ...user, status: !user.status } : user
      );
      setUsers(updatedUsers);
      toast.success("User status updated successfully");
    } catch (err) {
    toast.error("Error changing user status.");
    }
  };
  const items = [
    
    {
      key: '1',
      label: (
        <div 
          onClick={() => toggleUserStatus(record.key)}
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

 
    </div>
   
        
  )
}
