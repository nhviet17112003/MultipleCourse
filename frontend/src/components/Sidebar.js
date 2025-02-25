import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  AppstoreOutlined,
  MailOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { Link } from "react-router-dom";
import { useTheme } from "./context/ThemeContext";
function Sidebar() {
  const { theme } = useTheme();
  const [current, setCurrent] = useState("1");
  const [role, setRole] = useState("Student"); // Default to "Student"
  const [token, setToken] = useState(null);
  const location = useLocation();
  useEffect(() => {
    // Lấy thông tin từ localStorage khi component được mount hoặc token/role thay đổi
    const authToken = localStorage.getItem("authToken");
    const currentRole = localStorage.getItem("role");
    if (authToken && currentRole) {
      setToken(authToken);
      setRole(currentRole);

      console.log("Role:", currentRole);
    } else {
      setToken(null);
      setRole("Student"); // Reset lại role khi không có token
    }
  }, [token, role]);

  const onClick = (e) => {
    console.log("click ", e);
    setCurrent(e.key);
  };

  // Hiển thị các mục menu dựa trên role
  let items = [];
  if (role === "Student") {
    items = [
      {
        key: "sub1",
        label: "Student Navigation" ,
        icon: <MailOutlined />,
        children: [
          { key: "24", label: <Link to="/course-list">Courses List</Link> },
          { key: "1", label: <Link to="/my-courses">My Courses</Link> },
          {
            key: "2",
            label: <Link to="/my-certificate">My Certificates</Link>,
          },
          { key: "3", label: <Link to="/deposit">Deposit</Link> },
          {
            key: "4",
            label: <Link to="/deposit-history">Deposit History</Link>,
          },

          { key: "22", label: <Link to="/wallet">My Wallet</Link> },
          {
            key: "23",
            label: <Link to="/withdrawal-history">Withdrawal History</Link>,
          },
        ],
      },
    ];
  } else if (role === "Tutor") {
    items = [
      {
        key: "sub2",
        label: "Manage Courses",
        icon: <AppstoreOutlined />,
        children: [
          { key: "5", label: <Link to="courses-list-tutor">Course List</Link> },
          { key: "6", label: <Link to="/createcourse">Create Course</Link> },
          { key: "7", label: <Link to="/updatecourse">Update Course</Link> },
        ],
      },
      {
        key: "sub3",
        label: "Manage Students",
        icon: <AppstoreOutlined />,
        children: [
          {
            key: "8",
            label: <Link to="tutor/courses-list">Student List</Link>,
          },
        ],
      },

      {
        key: "sub4",
        label: " Manage Wallet",
        icon: <AppstoreOutlined />,
        children: [
          {
            key: "9",
            label: <Link to="tutor/courses-list">Buyer History</Link>,
          },
          {
            key: "10",
            label: <Link to="/withdrawal-history">Withdrawal History</Link>,
          },
          { key: "11", label: <Link to="/wallet">Wallet</Link> },
        ],
      },

      {
        key: "sub5",
        label: <Link to="/statistic-tutor">Statistics</Link>,
        icon: <AppstoreOutlined />,
      },
    ];
  } else if (role === "Admin") {
    items = [
      {
        key: "sub6",
        label: "Admin Navigation",
        icon: <SettingOutlined />,
        children: [
          {
            key: "12",
            label: <Link to="/manage-users">Manage Users</Link>,
          },
          {
            key: "13",
            label: <Link to="/course-list-for-admin">My Courses</Link>,
          },
          { key: "14", label: "Reports" },
          { key: "15", label: "System Settings" },
          {
            key: "16",
            label: <Link to="/wallet-manage-for-admin">Manage Withdrawal</Link>,
          },
          {
            key: "17",
            label: (
              <Link to="/purchase-history-for-admin">Purchase History</Link>
            ),
          },
          {
            key: "18",
            label: <Link to="/manage-review-for-admin">Manage Reviews</Link>,
          },
          {
            key: "19",
            label: <Link to="/manage-request-list">Manage Requests</Link>,
          },
          {
            key: "20",
            label: <Link to="/activities-history-list">Activities History</Link>,
          },
          {
            key: "21",
            label: <Link to="/buyer-history-list">Buyer History</Link>,
          },
          {
            key: "22",
            label: <Link to="/statistic-for-admin">Statistics</Link>,
          },
        ],
      },
    ];
  }
  // Danh sách các trang không muốn hiển thị Navbar
  const hideNavbarRoutes = ["/login", "/signup"];

  // Kiểm tra nếu đường dẫn hiện tại nằm trong danh sách cần ẩn Navbar
  if (hideNavbarRoutes.includes(location.pathname)) {
    return null; // Không render Navbar
  }

  return (
    <div
      className={
        theme === "dark" ? "bg-gray-800 text-white" : "bg-gray-200 text-black"
      }
    >
      <Menu
        theme={theme}
        onClick={onClick}
        style={{
          height: "100vh",
          width: 256,
        }}
        defaultOpenKeys={["sub1"]}
        selectedKeys={[current]}
        mode="inline"
        items={items}
      />
    </div>
  );
}

export default Sidebar;
