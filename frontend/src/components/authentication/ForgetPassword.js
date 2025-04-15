import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // Quản lý các bước
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [otpExpired, setOtpExpired] = useState(false); // Trạng thái kiểm soát OTP hết hạn
  const [timer, setTimer] = useState(60); // Thời gian đếm ngược OTP
  const [resendDisabled, setResendDisabled] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate(); // Khởi tạo useNavigate

  // Bắt đầu đếm ngược OTP khi chuyển sang bước 2
  useEffect(() => {
    if (step === 2) {
      setOtpExpired(false);
      setTimer(200);

      const countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            clearInterval(countdown);
            setOtpExpired(true);
            setStep(1); // Quay về bước nhập email
            setError("OTP has expired. Please re-enter your email.");
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdown);
    }
  }, [step]);
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(""), 3000);
  };
  const handleSendEmail = async () => {
    if (!email) {
      return showError("Email is required.");
    }

    // Regex kiểm tra định dạng email đơn giản
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return showError("Please enter a valid email address.");
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/users/forgot-password",
        { email }
      );

      if (response.status === 200) {
        setStep(2);
        showSuccess("OTP has been sent to your email.");
      }
    } catch (err) {
      showError("Unable to send OTP. Please check your email.");
    }
  };

  const handleResetPassword = async () => {
    if (!otp || otp.trim() === "") {
      return showError("OTP is required.");
    }

    if (!newPassword || newPassword.length < 6) {
      return showError("Password must be at least 6 characters.");
    }

    if (newPassword !== confirmPassword) {
      return showError("Passwords do not match.");
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/users/reset-password",
        { otp, newPassword }
      );

      if (response.status === 200) {
        showSuccess(response.data.message);
        setStep(3);
      }
    } catch (err) {
      if (err.response && err.response.data.message === "OTP expired") {
        showError("OTP has expired. Please re-enter your email.");
        setStep(1);
      } else {
        showError("Invalid or expired OTP.");
      }
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      return showError("Email is required before resending OTP.");
    }

    setOtpExpired(false);
    setTimer(20);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/users/resend-otp",
        { email }
      );

      if (response.status === 200) {
        showSuccess("A new OTP has been sent.");
      }
    } catch (err) {
      showError("Failed to resend OTP. Please try again.");
    }
  };

  const handleGoToLogin = () => {
    navigate("/login"); // Điều hướng sang trang đăng nhập
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-cyan-500 to-blue-500 px-4">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          {step === 1 && "Forgot Password"}
          {step === 2 && "OTP Confirmation"}
          {step === 3 && "Success!"}
        </h2>
        {error && (
          <div className="bg-red-100 text-red-700 py-3 px-5 mb-6 rounded border border-red-300">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="bg-cyan-100 text-cyan-700 py-3 px-5 mb-6 rounded border border-cyan-300">
            {successMessage}
          </div>
        )}

        {step === 1 && (
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-3"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              required
            />
            <button
              onClick={handleSendEmail}
              className="mt-6 w-full bg-cyan-500 text-white py-3 rounded hover:bg-cyan-600 transition duration-200"
            >
              Send OTP
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Enter OTP ({timer}s)
            </label>
            <input
              type="text"
              id="otp"
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter your OTP"
              required
            />

            <div className="relative mb-4">
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                New password
              </label>
              <input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
              <span
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-[65%] transform -translate-y-1/2 text-gray-600 cursor-pointer"
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div className="relative mb-4">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm Password
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
              <span
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-[65%] transform -translate-y-1/2 text-gray-600 cursor-pointer"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <button
              onClick={handleResetPassword}
              className="mt-6 w-full bg-cyan-500 text-white py-3 rounded hover:bg-cyan-600 transition duration-200"
              disabled={otpExpired}
            >
              Change Password
            </button>

            {otpExpired && (
              <button
                onClick={handleResendOTP}
                className="mt-4 w-full bg-yellow-500 text-white py-3 rounded hover:bg-yellow-600 transition duration-200"
              >
                Resend OTP
              </button>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="text-center">
            <FaCheckCircle className="text-cyan-500 text-6xl mx-auto mb-6" />
            <p className="text-lg text-gray-700 mb-6">
              Your password has been changed successfully!
            </p>
            <button
              onClick={handleGoToLogin}
              className="w-full bg-cyan-500 text-white py-3 rounded hover:bg-cyan-600 transition duration-200"
            >
              Back to Login page
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgetPassword;
