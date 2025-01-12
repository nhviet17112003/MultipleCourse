import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(""); // Cho thông báo tài khoản/mật khẩu
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("role");

    if (token && role) {
      const normalizedRole = role.toLowerCase(); // Normalize role
      if (normalizedRole === "tutor") {
        navigate("/homescreen");
      } else if (normalizedRole === "student") {
        navigate("/homescreen");
      }
    } 
  }, [navigate]);
  // Hàm kiểm tra Username
  const validateUsername = (username) => {
    if (username.trim().length === 0) {
      return "Username không được để trống.";
    }
    if (username.length < 4) {
      return "Username phải có ít nhất 4 ký tự.";
    }
    return "";
  };

  // Hàm kiểm tra Password
  const validatePassword = (password) => {
    if (password.length < 6) {
      return "Mật khẩu phải có ít nhất 6 ký tự.";
    }
    
    return "";
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Kiểm tra Username
    const usernameError = validateUsername(username);
    if (usernameError) {
      setError(usernameError);
      return;
    }
  
    // Kiểm tra Password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    // Reset các thông báo lỗi trước đó
    setError("");
    setSuccessMessage("");
  
    // Kiểm tra validation phía client
    if (username.trim().length === 0) {
      setError("Vui lòng nhập Username.");
      return;
    }
  
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
  
    try {
      const response = await axios.post(
        "http://localhost:3000/api/users/login",
        { username, password }
      );
  
      if (response.status === 200) {
        const { token, role, fullname } = response.data;
  
        // Lưu thông tin vào localStorage
        localStorage.setItem("authToken", token);
        localStorage.setItem("fullname", fullname);
        if (role.toLowerCase() === "tutor") {
          localStorage.setItem("role", role);
        }
  
        setSuccessMessage("Đăng nhập thành công!");
        setError("");
  
        setIsLoading(false);
  
        // Reload lại trang để cập nhật thông tin
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } catch (err) {
      setError("Tài khoản hoặc mật khẩu không đúng.");
      setSuccessMessage("");
    }
  };
  
  const handleSignUpForStudent = () => {
    navigate("/signup", { state: { role: "Student" } });
  };

  const handleSignUpForTutor = () => {
    navigate("/signup", { state: { role: "Tutor" } });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-100">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <div className="bg-white rounded-2xl shadow-2xl flex w-2/3 max-w-4xl">
          <div className="w-3/5 p-5">
            <div className="text-left font-bold">
              <span className="text-green-500">Welcome to</span> MultiCourse
            </div>
            <div className="py-10">
              <h2 className="text-3xl font-bold text-green-500 mb-2">LOGIN</h2>
              <div className="border-2 w-10 border-green-500 inline-block mb-2"></div>
              <div className="flex justify-center my-2">
                <button className="border-2 border-gray-200 rounded-full p-3 mx-1">
                  <FaGoogle className="text-sm" />
                </button>
              </div>
              <p className="text-gray-400 my-3">or use your UserName account</p>
              <div className="flex flex-col items-center">
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium text-gray-600"
                    ></label>
                    <input
                      type="text"
                      id="username"
                      className="mt-2 p-3 pr-10 w-full border border-green-500 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your Username"
                      required
                    />
                  </div>

                  <div className="mb-2 relative">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-600"
                    ></label>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className="mt-2 p-3 pr-10 w-full border border-green-500 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your Password"
                      required
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[55%] transform -translate-y-1/2 text-gray-600 focus:outline-none"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                  <div className="flex justify-between mb-6">
                    <button
                      type="button"
                      onClick={() => navigate("/forgetpassword")}
                      className="text-green-500 hover:underline focus:outline-none"
                    >
                      Forgot Password
                    </button>
                  </div>
                  {error && (
                    <div className="text-red-500 text-sm mb-4">{error}</div>
                  )}
                  {successMessage && (
                    <div className="text-green-500 text-sm mb-4">
                      {successMessage}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="border-2 border-green-500 text-green-500 rounded-full px-12 py-2 inline-block font-semibold hover:bg-green-500 hover:text-white"
                  >
                    {isLoading ? "Loading..." : "Login"}
                    
                  </button>
                </form>
              </div>
            </div>
          </div>
          <div className="w-2/5 bg-green-500 text-white rounded-tr-2xl rounded-br-2xl py-36 px-12">
            <h2 className="text-3xl font-bold mb-2">HELLO</h2>
            <div className="border-2 w-10 border-white inline-block mb-2"></div>
            <p className="mb-10">
              Fill up personal information and start journey with us.
            </p>
            <button
              type="button"
              onClick={handleSignUpForStudent}
              className="border-2 border-white rounded-full px-12 py-2 inline-block font-semibold hover:bg-white hover:text-green-500 mb-4"
            >
              SIGN UP FOR STUDENT
            </button>
            <button
              type="button"
              onClick={handleSignUpForTutor}
              className="border-2 border-white rounded-full px-12 py-2 inline-block font-semibold hover:bg-white hover:text-green-500"
            >
              SIGN UP FOR TUTOR
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
