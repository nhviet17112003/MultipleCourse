import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../src/index.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(""); // Cho thông báo tài khoản/mật khẩu
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 3000); // 3 giây
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:3000/api/users/login",
        {
          username,
          password,
        }
      );

      if (response.status === 200) {
        setSuccessMessage("Đăng nhập thành công!");
        setError(""); // Reset error message if successful
          // Lưu token vào localStorage
      localStorage.setItem("authToken", response.data.token);

        console.log(response.data); // Kiểm tra dữ liệu trả về từ API
        navigate("/userprofile"); // Điều hướng đến trang Home sau khi đăng nhập thành công
      }
    } catch (err) {
      if (err.response) {
        setError("Tài khoản hoặc mật khẩu không đúng.");
        setSuccessMessage("");
      }
    }
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  const handleViewTerms = () => {
    alert(
      "Điều khoản và nội quy: \n1. Không được chia sẻ thông tin đăng nhập.\n2. Tôn trọng người dùng khác.\n3. Tuân thủ quy định của hệ thống."
    );
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100 relative">
      {/* Error Notification */}
      {error && (
        <div className="absolute right-4 top-4 bg-red-500 text-white py-2 px-4 rounded shadow-lg flex items-center animate-slide-in-right">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M4.93 4.93a10 10 0 0114.14 0m0 14.14a10 10 0 01-14.14 0m14.14-14.14L4.93 19.07"
            />
          </svg>
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-4xl">
        {/* Left Image Section */}
        <div
          className="md:w-1/2 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://nguoinoitieng.tv/images/nnt/96/0/bbi0.jpg')",
          }}
        >
          <div className="flex flex-col justify-end h-full p-6 text-white bg-black bg-opacity-50">
            <h2 className="text-3xl font-bold">Lorem Ipsum</h2>
            <p className="mt-2">Lorem Ipsum is simply dummy text</p>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="md:w-1/2 p-8 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">
            Welcome to Lorem
          </h2>

          {successMessage && (
            <div className="text-green-600 mb-4">
              <p>{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-600"
              >
                User Name
              </label>
              <input
                type="text"
                id="username"
                className="mt-2 p-3 pr-10 w-full border border-teal-400 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your Username"
                required
              />
            </div>

            <div className="mb-4 relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-600"
              >
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="mt-2 p-3 pr-10 w-full border border-teal-400 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your Password"
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[67%] transform -translate-y-1/2 text-gray-600 focus:outline-none"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div className="flex justify-between mb-6">
              <button
                type="button"
                onClick={() => navigate("/forgetpassword")}
                className="text-teal-400 hover:underline focus:outline-none"
              >
                Quên mật khẩu
              </button>
              <button
                type="button"
                onClick={handleSignUp}
                className="text-gray-500 hover:underline focus:outline-none"
              >
                Sign Up
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-teal-400 text-white py-3 rounded-full hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-300"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
