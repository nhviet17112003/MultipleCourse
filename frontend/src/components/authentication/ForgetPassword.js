import React, { useState } from "react";
import axios from "axios";
import { FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // Quản lý các bước
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate(); // Khởi tạo useNavigate

  const handleSendEmail = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/users/forgot-password",
        { email }
      );

      if (response.status === 200) {
        setStep(2); // Chuyển sang bước nhập OTP
        setSuccessMessage("OTP đã được gửi đến email của bạn.");
        setError("");
      }
    } catch (err) {
      setError("Không thể gửi OTP. Vui lòng kiểm tra email của bạn.");
      setSuccessMessage("");
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới không khớp.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/users/reset-password",
        { otp, newPassword }
      );

      if (response.status === 200) {
        setSuccessMessage(response.data.message);
        setError("");
        setStep(3); // Chuyển sang bước thông báo thành công
      }
    } catch (err) {
      setError("OTP không chính xác hoặc đã hết hạn.");
      setSuccessMessage("");
    }
  };

  const handleGoToLogin = () => {
    navigate("/login"); // Điều hướng sang trang đăng nhập
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-teal-500">
          {step === 1 && "Quên Mật Khẩu"}
          {step === 2 && "Xác Nhận OTP"}
          {step === 3 && "Thành Công!"}
        </h2>

        {error && (
          <div className="bg-red-500 text-white py-2 px-4 mb-4 rounded">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-500 text-white py-2 px-4 mb-4 rounded">
            {successMessage}
          </div>
        )}

        {step === 1 && (
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-600 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-teal-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              required
            />
            <button
              onClick={handleSendEmail}
              className="mt-4 w-full bg-teal-500 text-white py-3 rounded hover:bg-teal-600"
            >
              Gửi OTP
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-gray-600 mb-2"
            >
              Nhập OTP
            </label>
            <input
              type="text"
              id="otp"
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-teal-400 mb-4"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Nhập mã OTP"
              required
            />

            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-600 mb-2"
            >
              Mật Khẩu Mới
            </label>
            <input
              type="password"
              id="newPassword"
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-teal-400 mb-4"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới"
              required
            />

            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-600 mb-2"
            >
              Xác Nhận Mật Khẩu
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-teal-400 mb-4"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Xác nhận mật khẩu mới"
              required
            />

            <button
              onClick={handleResetPassword}
              className="w-full bg-teal-500 text-white py-3 rounded hover:bg-teal-600"
            >
              Đổi Mật Khẩu
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="text-center">
            <FaCheckCircle className="text-teal-500 text-6xl mx-auto mb-4" />
            <p className="text-lg text-gray-600">Mật khẩu của bạn đã được thay đổi thành công!</p>
            <button
              onClick={handleGoToLogin} // Bấm vào nút để quay lại trang đăng nhập
              className="mt-4 w-full bg-teal-500 text-white py-3 rounded hover:bg-teal-600"
            >
              Quay lại trang Đăng nhập
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgetPassword;
