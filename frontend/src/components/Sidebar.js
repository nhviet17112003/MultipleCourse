import React, { useEffect, useState } from "react";
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
        label: "Student Navigation",
        icon: <MailOutlined />,
        children: [
          { key: "1", label: <Link to="/my-courses">My Courses</Link> },
          { key: "2", label: "My Assignments" },
          { key: "3", label: "My Grades" },
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
          { key: "12", label: "Manage Users" },
          { key: "13", label: "Manage Courses" },
          { key: "14", label: "Reports" },
          { key: "15", label: "System Settings" },
          {
            key: "16",
            label: <Link to="/wallet-manage-for-admin">Withdrawal Manage</Link>,
          },
        ],
      },
    ];
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
