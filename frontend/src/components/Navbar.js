  import React, { useEffect, useState } from "react";
  import { useNavigate, useLocation } from "react-router-dom";
  import axios from "axios";
  import { useTheme } from "./context/ThemeContext"; 
  import { Space, Switch, Input, Button, Dropdown, Menu } from 'antd';
  import { UserOutlined, LogoutOutlined, SearchOutlined } from '@ant-design/icons';

  const Navbar = () => {
    const navigate = useNavigate();
    const [fullname, setFullname] = useState("Người dùng");
    const [avatarUrl, setAvatarUrl] = useState(""); // Đường dẫn avatar
    const [error, setError] = useState("");
    const [userData, setUserData] = useState(null);
    const { theme, toggleTheme } = useTheme();
    const [searchQuery, setSearchQuery] = useState("");
    const [courses, setCourses] = useState([]);  // Mảng khóa học
    const [filteredCourses, setFilteredCourses] = useState([]); // Mảng khóa học sau khi lọc
    const location = useLocation();
    useEffect(() => {
      const token = localStorage.getItem("authToken");

      // Danh sách các đường dẫn cần kiểm tra token
      const protectedRoutes = ["/", "/userprofile", "/cart"];

      if (protectedRoutes.includes(location.pathname)) {
        if (!token) {
          navigate("/login"); // Chuyển về trang đăng nhập nếu không có token
        } else {
          // Nếu có token, tải thông tin người dùng
          const savedFullname = localStorage.getItem("fullname");
          const savedAvatar = localStorage.getItem("avatar");
          setFullname(savedFullname || "Người dùng");
          setAvatarUrl(savedAvatar || "https://via.placeholder.com/40");
        }
      }
    }, [navigate, location.pathname]);

    useEffect(() => {
      // Lấy token từ localStorage
      const token = localStorage.getItem("authToken");

      // Nếu không có token, thông báo lỗi hoặc điều hướng về trang login
      if (!token) {
        setError("Bạn cần đăng nhập để xem khóa học.");
        return;
      }

      // Gửi yêu cầu API với token
      const fetchCourses = async () => {
          try {
            const response = await axios.get(
              "http://localhost:3000/api/courses/all-courses",
              {
                headers: {
                  Authorization: `Bearer ${token}`, // Thêm token vào header
                },
              }
            );
            console.log("Dữ liệu nhận được từ server:", response.data); // Log dữ liệu trả về từ server
            setCourses(response.data);
          } catch (err) {
            if (err.response) {
              // Log chi tiết phản hồi lỗi từ server
              console.log("Lỗi từ server:", err.response);
              setError("Lỗi khi lấy danh sách khóa học: " + (err.response.data.message || "Không có thông tin chi tiết"));
            } else if (err.request) {
              // Log nếu không nhận được phản hồi từ server
              console.log("Không nhận được phản hồi từ server:", err.request);
              setError("Không nhận được phản hồi từ server.");
            } else {
              // Log nếu có lỗi xảy ra trong quá trình tạo yêu cầu
              console.log("Lỗi trong quá trình gửi yêu cầu:", err.message);
              setError("Đã có lỗi xảy ra.");
            }
          }
        };
        
        
        

      fetchCourses();
    }, []);
    const handleSearchChange = (e) => {
      setSearchQuery(e.target.value);
    };

    const handleSearchSubmit = () => {
      // Lọc khóa học theo title
      const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      navigate("/courses-list", { state: { courses: filteredCourses } }); // Chuyển đến trang ViewCourseList và truyền danh sách khóa học đã lọc
    };

    const goToUserProfile = () => {
      navigate("/userprofile");
    };
    const goToCart = () => {
    
      navigate("/cart");
    };
    const goToPurchaseHistory = () => {
    
      navigate("/purchase-history");
    };

    const logout = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (token) {
          await axios.post(
            "http://localhost:3000/api/users/logout", 
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }

        localStorage.removeItem("authToken");
        localStorage.removeItem("fullname");
        localStorage.removeItem("role");
        localStorage.removeItem("avatar");
      
        navigate("/login");
        window.location.reload();
      } catch (error) {
        console.error("Đăng xuất thất bại:", error);
        alert("Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại!");
      }
    };

    const fetchUserProfile = async () => {
      const token = localStorage.getItem("authToken");

      if (!token) {
        setError("You are not logged in. Please log in again.");
        navigate("/login"); // Redirect to login page
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:3000/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUserData(response.data); // Save user data
        console.log("User data:", response.data);
      } catch (err) {
        setError("Your session has expired. Please log in again.");
        localStorage.removeItem("authToken"); // Remove token
        navigate("/login"); // Redirect to login page
      }
    };

    useEffect(() => {
      fetchUserProfile();
    }, []);

    return (
      <nav className={` text-white shadow-md ${theme === "dark" ? "bg-gray-800" : "bg-teal-500"}`}>
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1
            className="text-xl font-bold cursor-pointer hover:text-yellow-300"
            onClick={() => navigate("/")}
          >
            MultiCourse
          </h1>

          {/* Search*/}
          <div className="flex items-center space-x-4">
            <Input
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search courses..."
              className={`w-64 px-4 py-2 rounded-lg focus:outline-none ${theme === "dark" ? "bg-gray-700 text-gray-900" : "bg-white text-gray-900"}`}
              style={{ border: "1px solid", borderColor: theme === "dark" ? "#444" : "#ccc" }}
              prefix={<SearchOutlined />}
            />
            <Button type="primary" onClick={handleSearchSubmit}>
              Search
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            {/* Dropdown Avatar */}
            <div className="relative group">
              <img
                src={userData?.avatar || avatarUrl}
                alt="Avatar"
                className="w-10 h-10 rounded-full cursor-pointer border-2 border-white"
              />
              <div  className="absolute right-0 mt-2 w-48 bg-white text-teal-900 rounded-lg shadow-lg z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="px-4 py-2 border-b border-gray-200 text-center">
                  <span className="font-semibold">{fullname}</span>
                </div>
                <button
                  className="block w-full px-4 py-2 text-left hover:bg-teal-100"
                  onClick={goToUserProfile}
                >
                  Profile
                </button>
                <button
                  className="block w-full px-4 py-2 text-left hover:bg-teal-100"
                  onClick={logout}
                >
                  Logout
                </button>
                <button
                className="block w-full px-4 py-2 text-left hover:bg-teal-100"
                onClick={goToCart}>
                  Cart
                
                </button>
                <button
                className="block w-full px-4 py-2 text-left hover:bg-teal-100"
                onClick={goToPurchaseHistory}>
                  Purchase history
                
                </button>
                <Space className="w-full justify-center py-3">
                  <Switch
                    onClick={toggleTheme}
                    checkedChildren="dark"
                    unCheckedChildren="light" 
                    defaultChecked={theme === "dark"}
                  />
                </Space>
              </div>
            </div>
          </div>
  
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
            <div className="px-4 py-2 border-b border-gray-200 text-center">
              <span className="font-semibold text-sm">{fullname}</span>
            </div>
            <button
              className="block w-full px-4 py-2 text-left hover:bg-gray-100"
              onClick={goToUserProfile}
            >
              <UserOutlined className="mr-2" /> Profile
            </button>
            <button
              className="block w-full px-4 py-2 text-left hover:bg-gray-100"
              onClick={logout}
            >
              <LogoutOutlined className="mr-2" /> Logout
            </button>
            <Space className="w-full justify-center py-3">
              <Switch
                onClick={toggleTheme}
                checkedChildren="dark"
                unCheckedChildren="light"
                defaultChecked={theme === "dark"}
              />
            </Space>
          </div>
        </div>
      </nav>
    );
  };

  export default Navbar;
