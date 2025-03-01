  import React, { useState, useEffect } from "react";
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
    const [otpExpired, setOtpExpired] = useState(false); // Trạng thái kiểm soát OTP hết hạn
    const [timer, setTimer] = useState(60); // Thời gian đếm ngược OTP
    const [resendDisabled, setResendDisabled] = useState(false);

    const navigate = useNavigate(); // Khởi tạo useNavigate

    // Bắt đầu đếm ngược OTP khi chuyển sang bước 2
    useEffect(() => {
      if (step === 2) {
        setOtpExpired(false);
        setTimer(20);
    
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

    const handleSendEmail = async () => {
      try {
        const response = await axios.post(
          "http://localhost:3000/api/users/forgot-password",
          { email }
        );

        if (response.status === 200) {
          setStep(2); // Chuyển sang bước nhập OTP
          setSuccessMessage("OTP has been sent to your email.");
          setError("");
        }
      } catch (err) {
        setError("Unable to send OTP. Please check your email.");
        setSuccessMessage("");
      }
    };

    const handleResetPassword = async () => {
      if (newPassword !== confirmPassword) {
        setError("New password does not match.");
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
          setStep(3);
        }
      } catch (err) {
        if (err.response && err.response.data.message === "OTP expired") {
          setError("OTP has expired. Please re-enter your email.");
          setStep(1); // Quay về bước nhập email
        } else {
          setError("OTP không hợp lệ hoặc đã hết hạn.");
        }
        setSuccessMessage("");
      }
    };

    const handleResendOTP = async () => {
      setOtpExpired(false);
      setTimer(20);

      try {
        const response = await axios.post(
          "http://localhost:3000/api/users/resend-otp",
          { email }
        );

        if (response.status === 200) {
          setSuccessMessage("A new OTP has been sent.");
          setError("");
        }
      } catch (err) {
        setError("Failed to resend OTP. Please try again.");
        setSuccessMessage("");
      }
    };

    const handleGoToLogin = () => {
      navigate("/login"); // Điều hướng sang trang đăng nhập
    };

    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6 text-green-500">
            {step === 1 && "Forgot Password"}
            {step === 2 && "OTP Confirmation"}
            {step === 3 && "Success!"}
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
              <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                required
              />
              <button
                onClick={handleSendEmail}
                className="mt-4 w-full bg-green-300 text-white py-3 rounded hover:bg-green-500"
              >
                Send OTP
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-600 mb-2">
                Enter OTP ({timer}s)
              </label>
              <input
                type="text"
                id="otp"
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter your OTP"
                required
              />

              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-600 mb-2">
                New password
              </label>
              <input
                type="password"
                id="newPassword"
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />

              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-600 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />

              <button
                onClick={handleResetPassword}
                className="mt-4 w-full bg-green-300 text-white py-3 rounded hover:bg-green-500"
                disabled={otpExpired}
              >
                Change Password
              </button>

              {otpExpired && (
                <button
                  onClick={handleResendOTP}
                  className="mt-2 w-full bg-yellow-400 text-white py-3 rounded hover:bg-yellow-500"
                >
                  Resend OTP
                </button>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="text-center">
              <FaCheckCircle className="text-teal-500 text-6xl mx-auto mb-4" />
              <p className="text-lg text-gray-600">
                Your password has been changed successfully!
              </p>
              <button
                onClick={handleGoToLogin}
                className="mt-4 w-full bg-green-300 text-white py-3 rounded hover:bg-green-500"
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
